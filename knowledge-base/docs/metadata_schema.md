# Schema de Metadados

Cada chunk possui metadados validados por Zod no backend.

Campos principais:

- `clinical_phase`
- `information_type`
- `target_user`
- `target_demographic`
- `clinical_criticality`
- `source_type`
- `source_name`
- `source_page`
- `source_reference`
- `keywords`
- `entities`
- `disease_classification`
- `medication_related`
- `dosage_related`
- `contraindication_related`
- `exam_related`
- `diagnosis_related`
- `reaction_related`
- `safety_level`
- `last_reviewed`
- `answer_policy`

O JSONL pode fornecer metadados completos ou parciais; defaults seguros são aplicados durante a validação.
