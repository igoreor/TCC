from __future__ import annotations

import argparse
import json
import sys
from pathlib import Path


def _build_corpus(args) -> None:
    from .corpus import CorpusConfig, build_corpus

    manifest = build_corpus(CorpusConfig.from_file(args.config), args.root, args.out)
    print(json.dumps({"snapshot_sha256": manifest["snapshot_sha256"], **manifest["stats"]}, ensure_ascii=False, indent=2))


def _merge_corpora(args) -> None:
    from .corpus import merge_corpora

    manifest = merge_corpora(args.components, args.corpus_id, args.out)
    print(json.dumps({"snapshot_sha256": manifest["snapshot_sha256"], **manifest["stats"],
                      "components": [(c["corpus_id"], c["chunks"]) for c in manifest["components"]]},
                     ensure_ascii=False, indent=2))


def _build_index(args) -> None:
    from .retrieval import build_embedder, build_index

    spec = json.loads(Path(args.embedder).read_text(encoding="utf-8"))
    manifest = build_index(args.corpus, build_embedder(spec), args.out, args.index_id)
    print(json.dumps({key: manifest[key] for key in ("index_id", "n_vectors", "dimension", "embeddings_sha256",
                                                     "build_seconds")}, indent=2))


def _run(args) -> None:
    from .retry import FatalProviderError
    from .runner import Experiment

    try:
        out_dir = Experiment(args.config, args.root, dry_run=args.dry_run, allow_api=args.allow_api,
                             continue_from=args.continue_from).run()
    except FatalProviderError as exc:
        print(f"ABORTADO: {exc}", file=sys.stderr)
        sys.exit(2)
    print(out_dir)


def _serve(args) -> None:
    from .serve import StudyService, make_server

    service = StudyService(args.config, args.root, dry_run=args.dry_run, allow_api=args.allow_api)
    server = make_server(service, args.host, args.port)
    mode = "SIMULADO (sem chamadas)" if args.dry_run else "real (assinaturas)"
    print(f"rag-study serve em http://{args.host}:{args.port} — modo {mode}; log ao vivo: {service.log_path}",
          flush=True)
    try:
        server.serve_forever()
    except KeyboardInterrupt:
        pass
    finally:
        server.server_close()


def _pool(args) -> None:
    from .evaluation import export_pool, load_records

    questions = {}
    targets = {}
    with open(args.questions, encoding="utf-8") as handle:
        for line in handle:
            if line.strip():
                item = json.loads(line)
                questions[item["question_id"]] = item["text"]
                targets[item["question_id"]] = item.get("target_sections") or []
    extra = None
    if args.target_sections:
        from .corpus import load_chunks
        from .questions import resolve_sections

        chunks = load_chunks(args.corpus)
        extra = {qid: resolve_sections(chunks, codes)["chunk_ids"] for qid, codes in targets.items() if codes}
    count = export_pool(load_records(args.runs), questions, args.corpus, args.depth, args.seed, args.out, extra)
    print(f"{count} pares pergunta-trecho exportados para {args.out}")


def _eval_retrieval(args) -> None:
    from .evaluation import load_qrels, load_records, retrieval_rows, summarize, write_csv

    rows = retrieval_rows(load_records(args.runs), load_qrels(args.qrels, args.annotation_round), args.k)
    out = Path(args.out)
    out.mkdir(parents=True, exist_ok=False)
    write_csv(rows, out / "retrieval-per-question.csv")
    summary = summarize(rows)
    write_csv(summary, out / "retrieval-summary.csv")
    print(json.dumps(summary, ensure_ascii=False, indent=2))


def _questions_sheet(args) -> None:
    from .questions import SHEET_COLUMNS, authoring_sheet, load_blueprint, write_sheet

    out = Path(args.out)
    if out.exists():
        raise FileExistsError(f"{out} já existe; não sobrescrevo uma planilha que pode estar preenchida")
    rows = authoring_sheet(load_blueprint(args.blueprint), args.corpus)
    write_sheet(rows, out, SHEET_COLUMNS)
    print(f"{len(rows)} vagas escritas em {out}")


def _questions_build(args) -> None:
    from .questions import build_question_files

    for name, path in build_question_files(args.sheet, args.out_dir, args.version).items():
        print(f"{name}: {path}")


def _questions_check(args) -> None:
    from .questions import check_questions, load_blueprint

    report = check_questions(args.questions, load_blueprint(args.blueprint), args.keypoints or [],
                             args.forbidden or [], corpus_dir=args.corpus,
                             allow_external_synthetic=args.allow_external_synthetic)
    print(json.dumps(report, ensure_ascii=False, indent=2))
    if report["errors"]:
        sys.exit(1)


def _questions_candidates(args) -> None:
    from .questions import candidate_matches, load_blueprint, read_table, write_sheet
    from .retrieval import ExactCosineRetriever, build_embedder

    spec = json.loads(Path(args.embedder).read_text(encoding="utf-8"))
    retriever = ExactCosineRetriever.load(args.index, args.corpus, build_embedder(spec))
    rows = candidate_matches(load_blueprint(args.blueprint), read_table(args.external), retriever.chunks,
                             retriever.embedder, retriever.embeddings, args.top)
    write_sheet(rows, _new_file(args.out), list(rows[0]))
    print(f"{len(rows)} sugestões para {len({row['slot_id'] for row in rows})} vagas em {args.out}")


def _questions_na_check(args) -> None:
    from .corpus import load_chunks
    from .questions import read_table, unanswerability_report

    report = unanswerability_report(load_chunks(args.corpus), read_table(args.queries), args.k)
    Path(_new_file(args.out)).write_text(report, encoding="utf-8")
    print(f"relatório em {args.out}")


def _questions_similarity(args) -> None:
    from .evaluation import write_csv
    from .questions import load_question_file, semantic_similarity_report
    from .retrieval import ExactCosineRetriever, build_embedder

    spec = json.loads(Path(args.embedder).read_text(encoding="utf-8"))
    retriever = ExactCosineRetriever.load(args.index, args.corpus, build_embedder(spec))
    questions = [item for path in args.questions for item in load_question_file(path)]
    rows, pairs = semantic_similarity_report(questions, retriever, args.pair_threshold)
    write_csv(rows, _new_file(args.out))
    print(json.dumps({"n_questions": len(rows), "similar_pairs": pairs}, ensure_ascii=False, indent=2))


def _auto_metrics(args) -> None:
    from .evaluation import load_records, write_csv
    from .review import auto_answer_metrics

    rows = [auto_answer_metrics(record) for record in load_records(args.runs) if record.get("mode") != "retrieval"]
    write_csv(rows, _new_file(args.out))
    print(f"{len(rows)} registros em {args.out}")


def _review_export(args) -> None:
    from .evaluation import load_records
    from .review import export_review, load_key_points, load_question_map

    counts = export_review(load_records(args.runs), load_question_map(args.questions),
                           load_key_points(args.keypoints), args.corpus, args.repetition, args.seed, args.out)
    print(json.dumps(counts))


def _review_import(args) -> None:
    from .evaluation import write_csv
    from .review import import_review

    rows = import_review(args.pass_a, args.key, args.pass_b, args.reviewer)
    write_csv(rows, _new_file(args.out))
    print(f"{len(rows)} respostas avaliadas em {args.out}")


def _read_rows(path: str) -> list[dict]:
    from .questions import read_table

    return read_table(path)


def _with_relevant(rows: list[dict]) -> list[dict]:
    """Retriever metrics are undefined for questions without any relevant chunk
    (protocol v0.3, 9.1); recall would be scored 0 and bias the means."""
    return [row for row in rows if str(row.get("n_relevant", "1")) not in {"0", ""}]


def _select_strategy(args) -> None:
    from .analysis import select_strategy

    result = select_strategy(_with_relevant(_read_rows(args.table)), margin=args.margin)
    Path(_new_file(args.out)).write_text(json.dumps(result, ensure_ascii=False, indent=2), encoding="utf-8")
    print(json.dumps(result, ensure_ascii=False, indent=2))


def _compare(args) -> None:
    from .analysis import compare_family
    from .evaluation import write_csv
    from .review import load_question_map

    clusters = None
    if args.questions:
        clusters = {qid: item.get("need_group") or qid for qid, item in load_question_map(args.questions).items()}
    comparisons = [tuple(pair.split(":")) for pair in args.comparisons.split(",")]
    rows = _read_rows(args.table)
    if args.exclude_no_relevant:
        rows = _with_relevant(rows)
    if args.only_questions:
        from .review import load_question_map

        allowed = {qid for qid, item in load_question_map(args.only_questions).items()
                   if item.get("answerable_from_corpus") in set(args.answerable.split(","))}
        rows = [row for row in rows if row["question_id"] in allowed]
    results = compare_family(rows, args.metric, comparisons, args.arms.split(","), args.test,
                             args.family, clusters, args.n_boot, args.n_perm, args.seed)
    write_csv(results, _new_file(args.out))
    print(json.dumps(results, ensure_ascii=False, indent=2))


def _agreement(args) -> None:
    from .analysis import cohen_kappa

    keys = args.on.split(",")
    first = {tuple(row[k] for k in keys): row[args.column] for row in _read_rows(args.first)}
    second = {tuple(row[k] for k in keys): row[args.column] for row in _read_rows(args.second)}
    shared = sorted(set(first) & set(second))
    a, b = [first[key] for key in shared], [second[key] for key in shared]
    categories = args.categories.split(",") if args.categories else None
    kappa = cohen_kappa(a, b, categories, args.weights)
    agreement = sum(x == y for x, y in zip(a, b)) / len(shared)
    print(json.dumps({"n": len(shared), "only_first": len(set(first) - set(second)),
                      "only_second": len(set(second) - set(first)), "percent_agreement": agreement,
                      "kappa": kappa, "weights": args.weights}, indent=2))


def _new_file(path: str) -> str:
    if Path(path).exists():
        raise FileExistsError(f"{path} já existe; resultados não são sobrescritos")
    Path(path).parent.mkdir(parents=True, exist_ok=True)
    return path


def main(argv: list[str] | None = None) -> None:
    parser = argparse.ArgumentParser(prog="rag-study")
    parser.add_argument("--root", default=".", help="raiz do workspace; caminhos das configs são relativos a ela")
    sub = parser.add_subparsers(dest="command", required=True)

    p = sub.add_parser("build-corpus", help="extrai e fatia o PDF em um snapshot imutável")
    p.add_argument("--config", required=True)
    p.add_argument("--out", required=True)
    p.set_defaults(func=_build_corpus)

    p = sub.add_parser("merge-corpora", help="junta corpora de um documento cada num corpus único")
    p.add_argument("--components", nargs="+", required=True, help="pastas de corpora congelados, na ordem")
    p.add_argument("--corpus-id", required=True)
    p.add_argument("--out", required=True)
    p.set_defaults(func=_merge_corpora)

    p = sub.add_parser("build-index", help="calcula embeddings do snapshot")
    p.add_argument("--corpus", required=True)
    p.add_argument("--embedder", required=True, help="JSON com a especificação do embedder")
    p.add_argument("--index-id", required=True)
    p.add_argument("--out", required=True)
    p.set_defaults(func=_build_index)

    p = sub.add_parser("run", help="executa um experimento")
    p.add_argument("--config", required=True)
    p.add_argument("--dry-run", action="store_true", help="usa provedores simulados; nenhuma API é chamada")
    p.add_argument("--allow-api", action="store_true", help="autoriza chamadas pagas às APIs")
    p.add_argument("--continue-from", nargs="*", help="lotes anteriores da mesma configuração; executa só o que falta")
    p.set_defaults(func=_run)

    p = sub.add_parser("serve", help="serviço local para a tela do estudo no NexoHansen (D41)")
    p.add_argument("--config", required=True, help="configuração da demonstração (config/demo/)")
    p.add_argument("--host", default="127.0.0.1", help="só endereços locais são aceitos")
    p.add_argument("--port", type=int, default=8765)
    p.add_argument("--dry-run", action="store_true", help="usa provedores simulados; nenhuma assinatura é usada")
    p.add_argument("--allow-api", action="store_true", help="autoriza chamadas reais aos modelos")
    p.set_defaults(func=_serve)

    p = sub.add_parser("pool", help="exporta pool cego para anotação de relevância")
    p.add_argument("--runs", nargs="+", required=True)
    p.add_argument("--questions", required=True)
    p.add_argument("--corpus", required=True)
    p.add_argument("--depth", type=int, default=10)
    p.add_argument("--seed", type=int, required=True)
    p.add_argument("--target-sections", action="store_true",
                   help="inclui todos os trechos das seções-alvo de cada pergunta (protocolo v0.3)")
    p.add_argument("--out", required=True)
    p.set_defaults(func=_pool)

    p = sub.add_parser("eval-retrieval", help="métricas do recuperador a partir de qrels")
    p.add_argument("--runs", nargs="+", required=True)
    p.add_argument("--qrels", required=True)
    p.add_argument("--k", type=int, required=True)
    p.add_argument("--annotation-round")
    p.add_argument("--out", required=True)
    p.set_defaults(func=_eval_retrieval)

    p = sub.add_parser("questions-sheet", help="gera a planilha de redação a partir do blueprint")
    p.add_argument("--blueprint", required=True)
    p.add_argument("--corpus", required=True)
    p.add_argument("--out", required=True)
    p.set_defaults(func=_questions_sheet)

    p = sub.add_parser("questions-build", help="converte a planilha preenchida em JSONL e pontos-chave")
    p.add_argument("--sheet", required=True)
    p.add_argument("--out-dir", required=True)
    p.add_argument("--version", default="v1")
    p.set_defaults(func=_questions_build)

    p = sub.add_parser("questions-check", help="valida as perguntas contra o blueprint antes de congelar")
    p.add_argument("--questions", nargs="+", required=True)
    p.add_argument("--blueprint", required=True)
    p.add_argument("--keypoints", nargs="*")
    p.add_argument("--forbidden", nargs="*", help="conjuntos que não podem ser reaproveitados (ex.: smoke)")
    p.add_argument("--corpus", help="corpus congelado: detecta frases e títulos copiados do PCDT")
    p.add_argument("--allow-external-synthetic", action="store_true",
                   help="aceita origin=sintetica_externa; só após emenda à D15 aprovada pelo orientador")
    p.set_defaults(func=_questions_check)

    p = sub.add_parser("questions-candidates", help="sugere perguntas publicadas (literais) para cada vaga")
    p.add_argument("--blueprint", required=True)
    p.add_argument("--external", required=True, help="CSV de perguntas externas literais, com fonte")
    p.add_argument("--index", required=True)
    p.add_argument("--corpus", required=True)
    p.add_argument("--embedder", required=True)
    p.add_argument("--top", type=int, default=5)
    p.add_argument("--out", required=True)
    p.set_defaults(func=_questions_candidates)

    p = sub.add_parser("questions-na-check", help="trechos lexicalmente próximos (BM25) para conferir não respondíveis")
    p.add_argument("--corpus", required=True)
    p.add_argument("--queries", required=True, help="CSV com colunas id, slot_id, text")
    p.add_argument("--k", type=int, default=10)
    p.add_argument("--out", required=True)
    p.set_defaults(func=_questions_na_check)

    p = sub.add_parser("questions-similarity", help="similaridade semântica (BGE-M3) entre perguntas e com o corpus")
    p.add_argument("--questions", nargs="+", required=True)
    p.add_argument("--index", required=True, help="pasta do índice BGE-M3 do corpus")
    p.add_argument("--corpus", required=True)
    p.add_argument("--embedder", required=True, help="JSON do embedder (o mesmo do índice)")
    p.add_argument("--pair-threshold", type=float, default=0.90)
    p.add_argument("--out", required=True)
    p.set_defaults(func=_questions_similarity)

    p = sub.add_parser("auto-metrics", help="descritores automáticos das respostas (sem julgamento)")
    p.add_argument("--runs", nargs="+", required=True)
    p.add_argument("--out", required=True)
    p.set_defaults(func=_auto_metrics)

    p = sub.add_parser("review-export", help="planilhas cegas de revisão humana (passagens A e B)")
    p.add_argument("--runs", nargs="+", required=True)
    p.add_argument("--questions", nargs="+", required=True)
    p.add_argument("--keypoints", required=True)
    p.add_argument("--corpus", required=True)
    p.add_argument("--repetition", type=int, default=0)
    p.add_argument("--seed", type=int, required=True)
    p.add_argument("--out", required=True)
    p.set_defaults(func=_review_export)

    p = sub.add_parser("review-import", help="junta as planilhas preenchidas à chave oculta")
    p.add_argument("--pass-a", required=True)
    p.add_argument("--pass-b")
    p.add_argument("--key", required=True)
    p.add_argument("--reviewer")
    p.add_argument("--out", required=True)
    p.set_defaults(func=_review_import)

    p = sub.add_parser("select-strategy", help="regra pré-especificada da etapa 1")
    p.add_argument("--table", required=True, help="retrieval-per-question.csv da etapa 1")
    p.add_argument("--margin", type=float, default=0.01)
    p.add_argument("--out", required=True)
    p.set_defaults(func=_select_strategy)

    p = sub.add_parser("compare", help="comparações pareadas de uma família, com Holm")
    p.add_argument("--table", required=True)
    p.add_argument("--metric", required=True)
    p.add_argument("--comparisons", required=True, help="pares A:B separados por vírgula; diferença = B - A")
    p.add_argument("--arms", required=True, help="braços separados por vírgula")
    p.add_argument("--test", choices=["permutation", "wilcoxon", "mcnemar"], required=True)
    p.add_argument("--family", required=True)
    p.add_argument("--questions", nargs="*", help="JSONL das perguntas (agrupa pares de registro no bootstrap)")
    p.add_argument("--exclude-no-relevant", action="store_true",
                   help="exclui perguntas sem trecho relevante (obrigatório para métricas do recuperador)")
    p.add_argument("--only-questions", nargs="*", help="JSONL das perguntas usado para filtrar por respondibilidade")
    p.add_argument("--answerable", default="sim,parcial", help="valores aceitos com --only-questions")
    p.add_argument("--n-boot", type=int, default=10000)
    p.add_argument("--n-perm", type=int, default=20000)
    p.add_argument("--seed", type=int, default=20261022)
    p.add_argument("--out", required=True)
    p.set_defaults(func=_compare)

    p = sub.add_parser("agreement", help="concordância entre dois avaliadores (kappa de Cohen)")
    p.add_argument("--first", required=True)
    p.add_argument("--second", required=True)
    p.add_argument("--on", required=True, help="colunas de junção, separadas por vírgula")
    p.add_argument("--column", required=True)
    p.add_argument("--weights", choices=["linear", "quadratic"])
    p.add_argument("--categories", help="ordem das categorias (obrigatória para escalas ordinais)")
    p.set_defaults(func=_agreement)

    args = parser.parse_args(argv)
    if sys.stdout.encoding and sys.stdout.encoding.lower() != "utf-8":
        sys.stdout.reconfigure(encoding="utf-8")
    args.func(args)


if __name__ == "__main__":
    main()
