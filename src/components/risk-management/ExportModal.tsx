import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import { Download, FileText, FileSpreadsheet } from 'lucide-react';
import { CSVExporter, ExportOptions } from '@/utils/csvExporter';
import { exportVisualHTML, exportVisualPDF, exportVisualPNG, exportToExcel as exportExcel } from '@/utils/reportExporter';

interface ExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  risks: any[];
  appliedFilters?: Record<string, any>;
  reportRef?: React.RefObject<HTMLDivElement>;
}

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

export const ExportModal = ({ isOpen, onClose, risks, appliedFilters, reportRef }: ExportModalProps) => {
  const [selectedFields, setSelectedFields] = useState<string[]>(
    ['codigo', 'categoria', 'descricao_risco', 'nivel_risco', 'probabilidade', 'impacto', 'status', 'estrategia', 'responsavel', 'projeto', 'data_identificacao']
  );
  const [exportFormat, setExportFormat] = useState<'csv' | 'json' | 'excel' | 'html-visual' | 'pdf-visual' | 'png-visual'>('csv');
  const [filename, setFilename] = useState('');
  const [includeMetadata, setIncludeMetadata] = useState(true);
  const [encoding, setEncoding] = useState<'utf-8' | 'utf-8-bom'>('utf-8-bom');
  const [delimiter, setDelimiter] = useState<',' | ';' | '\t'>(',');

  const handleFieldToggle = (field: string) => {
    setSelectedFields(prev => 
      prev.includes(field) 
        ? prev.filter(f => f !== field)
        : [...prev, field]
    );
  };

  const selectAllFields = () => {
    setSelectedFields(Object.keys(availableFields));
  };

  const deselectAllFields = () => {
    setSelectedFields([]);
  };

  const generateDefaultFilename = () => {
    const date = new Date().toISOString().split('T')[0];
    const extMap: Record<string, string> = {
      csv: 'csv',
      json: 'json',
      excel: 'xlsx',
      'html-visual': 'html',
      'pdf-visual': 'pdf',
      'png-visual': 'png',
    };
    const extension = extMap[exportFormat] || 'csv';
    return `riscos-${date}.${extension}`;
  };

  const handleExport = async () => {
    const finalFilename = filename || generateDefaultFilename();
    
    const metadata = {
      exportedAt: new Date().toLocaleString('pt-BR'),
      exportedBy: 'Usuário atual', // TODO: pegar do contexto de auth
      totalRecords: risks.length,
      filteredRecords: risks.length,
      appliedFilters
    };

    const options: ExportOptions = {
      filename: finalFilename,
      encoding,
      delimiter,
      includeMetadata,
      selectedFields: selectedFields.length > 0 ? selectedFields : undefined
    };

    try {
      switch (exportFormat) {
        case 'csv':
          await CSVExporter.exportRisksToCSV(risks, options, metadata);
          break;
        case 'json':
          await CSVExporter.exportToJSON(risks, finalFilename, metadata);
          break;
        case 'excel':
          await exportExcel(risks, selectedFields, finalFilename);
          break;
        case 'html-visual':
          await exportVisualHTML(reportRef as any, finalFilename, includeMetadata ? metadata : undefined);
          break;
        case 'pdf-visual':
          await exportVisualPDF(reportRef as any, finalFilename);
          break;
        case 'png-visual':
          await exportVisualPNG(reportRef as any, finalFilename);
          break;
      }
      onClose();
    } catch (error) {
      console.error('Erro na exportação:', error);
    }
  };

  const getFormatIcon = () => {
    switch (exportFormat) {
      case 'csv':
        return <FileText className="w-4 h-4" />;
      case 'excel':
        return <FileSpreadsheet className="w-4 h-4" />;
      case 'json':
        return <FileText className="w-4 h-4" />;
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Exportar Dados de Riscos</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Formato de Exportação */}
          <div className="space-y-3">
            <Label className="text-sm font-medium">Formato de Exportação</Label>
            <Select value={exportFormat} onValueChange={(value: any) => setExportFormat(value as any)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="csv">CSV (Comma Separated Values)</SelectItem>
                <SelectItem value="json">JSON (JavaScript Object Notation)</SelectItem>
                <SelectItem value="excel">Excel (XLSX)</SelectItem>
                <SelectItem value="html-visual">HTML (Relatório Visual)</SelectItem>
                <SelectItem value="pdf-visual">PDF (Relatório Visual)</SelectItem>
                <SelectItem value="png-visual">PNG (Imagem do Relatório)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Nome do Arquivo */}
          <div className="space-y-3">
            <Label className="text-sm font-medium">Nome do Arquivo</Label>
            <Input
              placeholder={generateDefaultFilename()}
              value={filename}
              onChange={(e) => setFilename(e.target.value)}
            />
            <p className="text-xs text-muted-foreground">
              Deixe em branco para usar o nome padrão: {generateDefaultFilename()}
            </p>
          </div>

          {/* Opções de CSV */}
          {exportFormat === 'csv' && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-sm font-medium">Codificação</Label>
                  <Select value={encoding} onValueChange={(value: 'utf-8' | 'utf-8-bom') => setEncoding(value)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="utf-8">UTF-8</SelectItem>
                      <SelectItem value="utf-8-bom">UTF-8 com BOM (Excel)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label className="text-sm font-medium">Delimitador</Label>
                  <Select value={delimiter} onValueChange={(value: ',' | ';' | '\t') => setDelimiter(value)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value=",">Vírgula (,)</SelectItem>
                      <SelectItem value=";">Ponto e vírgula (;)</SelectItem>
                      <SelectItem value="\t">Tab (\t)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
          )}

          {/* Incluir Metadados */}
          <div className="flex items-center space-x-2">
            <Checkbox
              id="includeMetadata"
              checked={includeMetadata}
              onCheckedChange={(checked) => setIncludeMetadata(!!checked)}
            />
            <Label htmlFor="includeMetadata" className="text-sm">
              Incluir metadados (data de exportação, filtros aplicados, etc.)
            </Label>
          </div>

          <Separator />

          {/* Seleção de Campos */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Label className="text-sm font-medium">Campos para Exportar</Label>
              <div className="space-x-2">
                <Button variant="outline" size="sm" onClick={selectAllFields}>
                  Selecionar Todos
                </Button>
                <Button variant="outline" size="sm" onClick={deselectAllFields}>
                  Desmarcar Todos
                </Button>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 max-h-60 overflow-y-auto">
              {Object.entries(availableFields).map(([field, label]) => (
                <div key={field} className="flex items-center space-x-2">
                  <Checkbox
                    id={field}
                    checked={selectedFields.includes(field)}
                    onCheckedChange={() => handleFieldToggle(field)}
                  />
                  <Label htmlFor={field} className="text-sm cursor-pointer">
                    {label}
                  </Label>
                </div>
              ))}
            </div>

            <p className="text-xs text-muted-foreground">
              {selectedFields.length} campo(s) selecionado(s)
            </p>
          </div>

          {/* Resumo */}
          <div className="bg-muted p-4 rounded-lg space-y-2">
            <h4 className="font-medium text-sm">Resumo da Exportação</h4>
            <p className="text-sm text-muted-foreground">
              • {risks.length} risco(s) serão exportados
            </p>
            <p className="text-sm text-muted-foreground">
              • Formato: {exportFormat.toUpperCase()}
            </p>
            <p className="text-sm text-muted-foreground">
              • {selectedFields.length} campo(s) incluído(s)
            </p>
            {includeMetadata && (
              <p className="text-sm text-muted-foreground">
                • Metadados incluídos
              </p>
            )}
          </div>

          {/* Botões de Ação */}
          <div className="flex justify-end space-x-3">
            <Button variant="outline" onClick={onClose}>
              Cancelar
            </Button>
            <Button 
              onClick={handleExport}
              disabled={(exportFormat === 'csv' || exportFormat === 'excel') && selectedFields.length === 0}
            >
              {getFormatIcon()}
              Exportar
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};