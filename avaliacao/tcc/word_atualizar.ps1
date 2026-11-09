# Abre o DOCX no Word, atualiza a numeração (campos SEQ), o sumário e as listas de ilustrações e
# tabelas, salva e exporta um PDF de conferência.
# Uso: powershell -File word_atualizar.ps1 -Docx <arquivo.docx> -Pdf <saida.pdf>
param([string]$Docx, [string]$Pdf)
$ErrorActionPreference = 'Stop'
$word = New-Object -ComObject Word.Application
$word.Visible = $false
$word.DisplayAlerts = 0
$doc = $null
try {
  $doc = $word.Documents.Open($Docx, $false, $false, $false)
  $doc.Fields.Update() | Out-Null
  $doc.Repaginate()
  foreach ($toc in $doc.TablesOfContents) { $toc.Update() }
  foreach ($tof in $doc.TablesOfFigures) { $tof.Update() }
  $doc.Fields.Update() | Out-Null
  $doc.Repaginate()
  foreach ($toc in $doc.TablesOfContents) { $toc.Update() }
  foreach ($tof in $doc.TablesOfFigures) { $tof.Update() }
  "Paginas: " + $doc.ComputeStatistics(2)
  $doc.Save()
  if ($Pdf) { $doc.ExportAsFixedFormat($Pdf, 17) }
  $doc.Close($false)
  $doc = $null
} finally {
  if ($doc) { $doc.Close($false) }
  $word.Quit()
  [System.Runtime.InteropServices.Marshal]::ReleaseComObject($word) | Out-Null
}
