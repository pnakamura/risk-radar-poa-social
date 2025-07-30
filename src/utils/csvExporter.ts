import { toast } from 'sonner';

export interface ExportOptions {
  filename?: string;
  encoding?: 'utf-8' | 'utf-8-bom';
  delimiter?: ',' | ';' | '\t';
  includeMetadata?: boolean;
  selectedFields?: string[];
}

export interface ExportMetadata {
  exportedAt: string;
  exportedBy: string;
  totalRecords: number;
  filteredRecords: number;
  appliedFilters?: Record<string, any>;
}

export class CSVExporter {
  private static escapeCSVField(field: any): string {
    if (field === null || field === undefined) return '';
    
    const stringField = String(field);
    
    // Se contém vírgula, quebra de linha ou aspas, precisa ser envolvido em aspas
    if (stringField.includes(',') || stringField.includes('\n') || stringField.includes('"')) {
      // Escape das aspas duplicando elas
      return `"${stringField.replace(/"/g, '""')}"`;
    }
    
    return stringField;
  }

  private static formatDate(date: string | Date | null): string {
    if (!date) return '';
    
    try {
      const dateObj = typeof date === 'string' ? new Date(date) : date;
      return dateObj.toLocaleDateString('pt-BR');
    } catch {
      return String(date);
    }
  }

  private static formatCurrency(value: number | null): string {
    if (!value) return '';
    
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  }

  private static generateMetadataRows(metadata: ExportMetadata): string[] {
    const rows = [
      `Exportado em,${this.escapeCSVField(metadata.exportedAt)}`,
      `Exportado por,${this.escapeCSVField(metadata.exportedBy)}`,
      `Total de registros,${metadata.totalRecords}`,
      `Registros filtrados,${metadata.filteredRecords}`,
      '',
      ''
    ];

    if (metadata.appliedFilters && Object.keys(metadata.appliedFilters).length > 0) {
      rows.push('Filtros aplicados:');
      Object.entries(metadata.appliedFilters).forEach(([key, value]) => {
        if (value) {
          rows.push(`${key},${this.escapeCSVField(value)}`);
        }
      });
      rows.push('');
    }

    return rows;
  }

  static async exportRisksToCSV(
    risks: any[],
    options: ExportOptions = {},
    metadata?: ExportMetadata
  ): Promise<void> {
    try {
      const {
        filename = `riscos-${new Date().toISOString().split('T')[0]}.csv`,
        encoding = 'utf-8-bom',
        delimiter = ',',
        includeMetadata = true,
        selectedFields
      } = options;

      if (risks.length === 0) {
        toast.error('Nenhum risco para exportar');
        return;
      }

      // Definir campos disponíveis (corrigidos para corresponder ao banco de dados)
      const availableFields = {
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
        updated_at: 'Última Atualização'
      };

      // Usar campos selecionados ou todos os campos
      const fieldsToExport = selectedFields || Object.keys(availableFields);
      const headers = fieldsToExport.map(field => availableFields[field as keyof typeof availableFields]);

      const rows: string[] = [];

      // Adicionar metadados se solicitado
      if (includeMetadata && metadata) {
        rows.push(...this.generateMetadataRows(metadata));
      }

      // Adicionar cabeçalhos
      rows.push(headers.join(delimiter));

      // Adicionar dados dos riscos
      risks.forEach(risk => {
        const row = fieldsToExport.map(field => {
          let value = risk[field];

          // Tratamento especial para campos específicos
          switch (field) {
            case 'responsavel':
              value = risk.responsavel?.nome || '';
              break;
            case 'projeto':
              value = risk.projeto?.nome || '';
              break;
            case 'criado_por':
              value = risk.criador?.nome || '';
              break;
            case 'data_identificacao':
            case 'created_at':
            case 'updated_at':
            case 'prazo':
              value = this.formatDate(value);
              break;
            default:
              // Manter valor original para outros campos
              break;
          }

          return this.escapeCSVField(value);
        });

        rows.push(row.join(delimiter));
      });

      const csvContent = rows.join('\n');

      // Adicionar BOM se solicitado (para melhor compatibilidade com Excel)
      const bom = encoding === 'utf-8-bom' ? '\uFEFF' : '';
      const finalContent = bom + csvContent;

      // Usar File System Access API se disponível (Chrome 86+)
      if ('showSaveFilePicker' in window) {
        try {
          const fileHandle = await (window as any).showSaveFilePicker({
            suggestedName: filename,
            types: [
              {
                description: 'Arquivos CSV',
                accept: {
                  'text/csv': ['.csv'],
                },
              },
            ],
          });

          const writable = await fileHandle.createWritable();
          await writable.write(finalContent);
          await writable.close();

          toast.success('Arquivo CSV exportado com sucesso!');
        } catch (error: any) {
          if (error.name !== 'AbortError') {
            console.error('Erro ao salvar arquivo:', error);
            this.fallbackDownload(finalContent, filename);
          }
        }
      } else {
        // Fallback para navegadores que não suportam File System Access API
        this.fallbackDownload(finalContent, filename);
      }
    } catch (error) {
      console.error('Erro na exportação CSV:', error);
      toast.error('Erro ao exportar arquivo CSV');
    }
  }

  private static fallbackDownload(content: string, filename: string): void {
    const blob = new Blob([content], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    
    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    link.style.visibility = 'hidden';
    
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    URL.revokeObjectURL(url);
    toast.success('Arquivo CSV exportado com sucesso!');
  }

  static async exportToExcel(
    risks: any[],
    filename: string = `riscos-${new Date().toISOString().split('T')[0]}.xlsx`
  ): Promise<void> {
    // Placeholder para futura implementação com biblioteca como SheetJS
    toast.info('Exportação para Excel será implementada em breve!');
  }

  static async exportToJSON(
    risks: any[],
    filename: string = `riscos-${new Date().toISOString().split('T')[0]}.json`,
    metadata?: ExportMetadata
  ): Promise<void> {
    try {
      const exportData = {
        metadata,
        risks,
        exportedAt: new Date().toISOString()
      };

      const jsonContent = JSON.stringify(exportData, null, 2);

      if ('showSaveFilePicker' in window) {
        try {
          const fileHandle = await (window as any).showSaveFilePicker({
            suggestedName: filename,
            types: [
              {
                description: 'Arquivos JSON',
                accept: {
                  'application/json': ['.json'],
                },
              },
            ],
          });

          const writable = await fileHandle.createWritable();
          await writable.write(jsonContent);
          await writable.close();

          toast.success('Arquivo JSON exportado com sucesso!');
        } catch (error: any) {
          if (error.name !== 'AbortError') {
            this.fallbackJSONDownload(jsonContent, filename);
          }
        }
      } else {
        this.fallbackJSONDownload(jsonContent, filename);
      }
    } catch (error) {
      console.error('Erro na exportação JSON:', error);
      toast.error('Erro ao exportar arquivo JSON');
    }
  }

  private static fallbackJSONDownload(content: string, filename: string): void {
    const blob = new Blob([content], { type: 'application/json;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    
    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    link.style.visibility = 'hidden';
    
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    URL.revokeObjectURL(url);
    toast.success('Arquivo JSON exportado com sucesso!');
  }
}