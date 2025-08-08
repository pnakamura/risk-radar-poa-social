import { toPng } from 'html-to-image';
import { jsPDF } from 'jspdf';
import * as XLSX from 'xlsx';
import { toast } from 'sonner';

function ensureExt(filename: string, desiredExt: 'png' | 'pdf' | 'html' | 'xlsx') {
  const cleaned = filename.replace(/\.(csv|json|xlsx|pdf|png|html)$/i, '');
  return `${cleaned}.${desiredExt}`;
}

function downloadDataUrl(dataUrl: string, filename: string) {
  const link = document.createElement('a');
  link.href = dataUrl;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

export async function exportVisualPNG(
  containerRef: React.RefObject<HTMLElement>,
  filename = `relatorio-${new Date().toISOString().split('T')[0]}.png`
) {
  if (!containerRef.current) throw new Error('Elemento do relatório não encontrado');
  try {
    toast.info('Gerando imagem do relatório...');
    const dataUrl = await toPng(containerRef.current, {
      pixelRatio: 2,
      cacheBust: true,
      backgroundColor: '#ffffff',
      filter: (node) => {
        if (!(node instanceof Element)) return true;
        const el = node as Element;
        // Excluir tooltips, menus flutuantes e elementos marcados
        const classes = el.classList || { contains: () => false } as any;
        return !classes.contains('recharts-tooltip-wrapper') && !classes.contains('no-export');
      },
    });
    downloadDataUrl(dataUrl, ensureExt(filename, 'png'));
    toast.success('Imagem exportada com sucesso!');
  } catch (e) {
    console.error(e);
    toast.error('Falha ao gerar PNG');
    throw e;
  }
}

export async function exportVisualPDF(
  containerRef: React.RefObject<HTMLElement>,
  filename = `relatorio-${new Date().toISOString().split('T')[0]}.pdf`
) {
  if (!containerRef.current) throw new Error('Elemento do relatório não encontrado');
  try {
    toast.info('Gerando PDF do relatório...');
    const dataUrl = await toPng(containerRef.current, {
      pixelRatio: 2,
      cacheBust: true,
      backgroundColor: '#ffffff',
      filter: (node) => {
        if (!(node instanceof Element)) return true;
        const el = node as Element;
        const classes = el.classList || { contains: () => false } as any;
        return !classes.contains('recharts-tooltip-wrapper') && !classes.contains('no-export');
      },
    });

    // Criar PDF A4 e encaixar a imagem na página mantendo proporção
    const pdf = new jsPDF({ unit: 'mm', format: 'a4', orientation: 'p' });
    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();
    const margin = 10;
    const maxWidth = pageWidth - margin * 2;
    const maxHeight = pageHeight - margin * 2;

    // Precisamos das dimensões da imagem para calcular a escala
    const img = new Image();
    const dims = await new Promise<{ w: number; h: number }>((resolve, reject) => {
      img.onload = () => resolve({ w: img.naturalWidth, h: img.naturalHeight });
      img.onerror = reject;
      img.src = dataUrl;
    });

    const imgRatio = dims.w / dims.h;
    let drawWidth = maxWidth;
    let drawHeight = drawWidth / imgRatio;
    if (drawHeight > maxHeight) {
      drawHeight = maxHeight;
      drawWidth = drawHeight * imgRatio;
    }

    const x = (pageWidth - drawWidth) / 2;
    const y = (pageHeight - drawHeight) / 2;

    pdf.addImage(dataUrl, 'PNG', x, y, drawWidth, drawHeight, undefined, 'FAST');
    pdf.save(ensureExt(filename, 'pdf'));
    toast.success('PDF exportado com sucesso!');
  } catch (e) {
    console.error(e);
    toast.error('Falha ao gerar PDF');
    throw e;
  }
}

export async function exportVisualHTML(
  containerRef: React.RefObject<HTMLElement>,
  filename = `relatorio-${new Date().toISOString().split('T')[0]}.html`,
  metadata?: { exportedAt?: string; exportedBy?: string; appliedFilters?: Record<string, any> }
) {
  if (!containerRef.current) throw new Error('Elemento do relatório não encontrado');
  try {
    toast.info('Gerando HTML do relatório...');
    const dataUrl = await toPng(containerRef.current, {
      pixelRatio: 2,
      cacheBust: true,
      backgroundColor: '#ffffff',
      filter: (node) => {
        if (!(node instanceof Element)) return true;
        const el = node as Element;
        const classes = el.classList || { contains: () => false } as any;
        return !classes.contains('recharts-tooltip-wrapper') && !classes.contains('no-export');
      },
    });

    const safeFilename = ensureExt(filename, 'html');
    const html = `<!doctype html>
<html lang="pt-BR">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>Relatório de Riscos</title>
  <meta name="description" content="Relatório visual de riscos exportado" />
  <style>
    :root { color-scheme: light dark; }
    body { font-family: system-ui, -apple-system, Segoe UI, Roboto, Ubuntu, Cantarell, Noto Sans, Arial, 'Apple Color Emoji', 'Segoe UI Emoji'; margin: 0; padding: 24px; background: #f8fafc; color: #0f172a; }
    header { margin-bottom: 16px; }
    h1 { font-size: 20px; margin: 0 0 8px; }
    .meta { font-size: 12px; color: #64748b; }
    .card { background: #ffffff; border-radius: 12px; padding: 16px; box-shadow: 0 10px 30px -12px rgba(2,6,23,0.12); }
    img { max-width: 100%; height: auto; border-radius: 8px; display: block; }
    footer { margin-top: 16px; font-size: 12px; color: #64748b; }
    .filters { margin-top: 6px; white-space: pre-wrap; }
  </style>
  <link rel="canonical" href="/relatorio-riscos.html" />
</head>
<body>
  <article class="card" itemscope itemtype="https://schema.org/Report">
    <header>
      <h1 itemprop="name">Relatório de Riscos</h1>
      <div class="meta">
        <div>Exportado em: ${metadata?.exportedAt || new Date().toLocaleString('pt-BR')}</div>
        ${metadata?.exportedBy ? `<div>Usuário: ${metadata.exportedBy}</div>` : ''}
        ${metadata?.appliedFilters ? `<div class="filters">Filtros: ${Object.entries(metadata.appliedFilters).map(([k,v]) => `${k}: ${typeof v === 'object' ? JSON.stringify(v) : v}`).join(' | ')}</div>` : ''}
      </div>
    </header>
    <main>
      <img src="${dataUrl}" alt="Relatório de riscos - visual" />
    </main>
    <footer>Gerado automaticamente</footer>
  </article>
</body>
</html>`;

    const blob = new Blob([html], { type: 'text/html;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    downloadDataUrl(url, safeFilename);
    URL.revokeObjectURL(url);
    toast.success('HTML exportado com sucesso!');
  } catch (e) {
    console.error(e);
    toast.error('Falha ao gerar HTML');
    throw e;
  }
}

export async function exportToExcel(
  risks: any[],
  selectedFields?: string[],
  filename = `riscos-${new Date().toISOString().split('T')[0]}.xlsx`
) {
  try {
    if (!risks || risks.length === 0) {
      toast.error('Nenhum risco para exportar');
      return;
    }

    const availableFields: Record<string, string> = {
      codigo: 'Código',
      categoria: 'Categoria',
      descricao_risco: 'Descrição do Risco',
      causas: 'Causas',
      consequencias: 'Consequências',
      nivel_risco: 'Nível do Risco',
      probabilidade: 'Probabilidade',
      impacto: 'Impacto',
      status: 'Status',
      estrategia: 'Estratégia',
      responsavel: 'Responsável',
      projeto: 'Projeto',
      data_identificacao: 'Data de Identificação',
      prazo: 'Prazo',
      acoes_mitigacao: 'Ações de Mitigação',
      acoes_contingencia: 'Ações de Contingência',
      observacoes: 'Observações',
      criado_por: 'Criado Por',
      created_at: 'Data de Criação',
      updated_at: 'Última Atualização',
    };

    const fields = (selectedFields && selectedFields.length > 0)
      ? selectedFields
      : Object.keys(availableFields);

    const headers = fields.map((f) => availableFields[f] || f);

    const rows = risks.map((risk) => {
      const row: Record<string, any> = {};
      fields.forEach((f, idx) => {
        let value = risk[f as keyof typeof risk];
        switch (f) {
          case 'responsavel':
            value = (risk as any).responsavel?.nome || '';
            break;
          case 'projeto':
            value = (risk as any).projeto?.nome || '';
            break;
          case 'criado_por':
            value = (risk as any).criador?.nome || '';
            break;
          case 'data_identificacao':
          case 'created_at':
          case 'updated_at':
          case 'prazo':
            value = value ? new Date(value as any).toLocaleDateString('pt-BR') : '';
            break;
        }
        row[headers[idx]] = value ?? '';
      });
      return row;
    });

    const ws = XLSX.utils.json_to_sheet(rows, { header: headers });
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Riscos');

    XLSX.writeFile(wb, ensureExt(filename, 'xlsx'));
    toast.success('Excel exportado com sucesso!');
  } catch (e) {
    console.error(e);
    toast.error('Falha ao gerar Excel');
    throw e;
  }
}
