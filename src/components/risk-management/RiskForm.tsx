
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Plus, Save, AlertTriangle } from 'lucide-react';
import { toast } from 'sonner';

interface RiskFormProps {
  onSuccess: () => void;
}

const RiskForm = ({ onSuccess }: RiskFormProps) => {
  const [formData, setFormData] = useState({
    codigo: '',
    categoria: '',
    descricaoRisco: '',
    causas: '',
    consequencias: '',
    probabilidade: '',
    impacto: '',
    estrategia: '',
    acoesMitigacao: '',
    acoesContingencia: '',
    responsavel: '',
    prazo: '',
    status: '',
    observacoes: '',
    projeto: ''
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const calculateRiskLevel = () => {
    const { probabilidade, impacto } = formData;
    
    if (!probabilidade || !impacto) return '';
    
    const probScore = probabilidade === 'Alta' ? 3 : probabilidade === 'Média' ? 2 : 1;
    const impactScore = impacto === 'Alto' ? 3 : impacto === 'Médio' ? 2 : 1;
    const riskScore = probScore * impactScore;
    
    if (riskScore >= 6) return 'Alto';
    if (riskScore >= 3) return 'Médio';
    return 'Baixo';
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // Validação básica
      if (!formData.codigo || !formData.descricaoRisco || !formData.probabilidade || !formData.impacto) {
        toast.error('Por favor, preencha todos os campos obrigatórios');
        return;
      }

      // Calcular nível de risco automaticamente
      const nivelRisco = calculateRiskLevel();
      
      const riskData = {
        ...formData,
        nivelRisco,
        dataIdentificacao: new Date().toISOString().split('T')[0],
        id: Date.now().toString()
      };

      // Simular salvamento
      console.log('Salvando risco:', riskData);
      
      // Aqui seria a integração com Google Sheets ou API
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      toast.success('Risco cadastrado com sucesso!');
      
      // Resetar formulário
      setFormData({
        codigo: '',
        categoria: '',
        descricaoRisco: '',
        causas: '',
        consequencias: '',
        probabilidade: '',
        impacto: '',
        estrategia: '',
        acoesMitigacao: '',
        acoesContingencia: '',
        responsavel: '',
        prazo: '',
        status: '',
        observacoes: '',
        projeto: ''
      });
      
      onSuccess();
      
    } catch (error) {
      console.error('Erro ao salvar risco:', error);
      toast.error('Erro ao salvar o risco. Tente novamente.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const nivelRisco = calculateRiskLevel();

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Plus className="w-5 h-5" />
            Cadastro de Novo Risco
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Informações Básicas */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="codigo">Código do Risco *</Label>
                <Input
                  id="codigo"
                  value={formData.codigo}
                  onChange={(e) => handleChange('codigo', e.target.value)}
                  placeholder="RSK-001"
                  required
                />
              </div>
              
              <div>
                <Label htmlFor="categoria">Categoria *</Label>
                <Select value={formData.categoria} onValueChange={(value) => handleChange('categoria', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione a categoria" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Tecnologia">Tecnologia</SelectItem>
                    <SelectItem value="Recursos Humanos">Recursos Humanos</SelectItem>
                    <SelectItem value="Financeiro">Financeiro</SelectItem>
                    <SelectItem value="Operacional">Operacional</SelectItem>
                    <SelectItem value="Compliance">Compliance</SelectItem>
                    <SelectItem value="Estratégico">Estratégico</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div>
              <Label htmlFor="descricaoRisco">Descrição do Risco *</Label>
              <Textarea
                id="descricaoRisco"
                value={formData.descricaoRisco}
                onChange={(e) => handleChange('descricaoRisco', e.target.value)}
                placeholder="Descreva detalhadamente o risco identificado..."
                required
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="causas">Causas</Label>
                <Textarea
                  id="causas"
                  value={formData.causas}
                  onChange={(e) => handleChange('causas', e.target.value)}
                  placeholder="Quais são as possíveis causas deste risco?"
                />
              </div>
              
              <div>
                <Label htmlFor="consequencias">Consequências</Label>
                <Textarea
                  id="consequencias"
                  value={formData.consequencias}
                  onChange={(e) => handleChange('consequencias', e.target.value)}
                  placeholder="Quais são as possíveis consequências?"
                />
              </div>
            </div>

            {/* Avaliação de Risco */}
            <div className="border-t pt-6">
              <h3 className="text-lg font-semibold mb-4">Avaliação de Risco</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="probabilidade">Probabilidade *</Label>
                  <Select value={formData.probabilidade} onValueChange={(value) => handleChange('probabilidade', value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Baixa">Baixa</SelectItem>
                      <SelectItem value="Média">Média</SelectItem>
                      <SelectItem value="Alta">Alta</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <Label htmlFor="impacto">Impacto *</Label>
                  <Select value={formData.impacto} onValueChange={(value) => handleChange('impacto', value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Baixo">Baixo</SelectItem>
                      <SelectItem value="Médio">Médio</SelectItem>
                      <SelectItem value="Alto">Alto</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <Label>Nível de Risco (Calculado)</Label>
                  <div className={`p-3 rounded-md text-center font-semibold ${
                    nivelRisco === 'Alto' ? 'bg-red-100 text-red-800' :
                    nivelRisco === 'Médio' ? 'bg-yellow-100 text-yellow-800' :
                    nivelRisco === 'Baixo' ? 'bg-green-100 text-green-800' :
                    'bg-gray-100 text-gray-800'
                  }`}>
                    {nivelRisco || 'Não calculado'}
                  </div>
                </div>
              </div>
            </div>

            {/* Estratégias de Resposta */}
            <div className="border-t pt-6">
              <h3 className="text-lg font-semibold mb-4">Estratégias de Resposta</h3>
              
              <div className="space-y-4">
                <div>
                  <Label htmlFor="estrategia">Estratégia</Label>
                  <Select value={formData.estrategia} onValueChange={(value) => handleChange('estrategia', value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione a estratégia" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Mitigar">Mitigar</SelectItem>
                      <SelectItem value="Aceitar">Aceitar</SelectItem>
                      <SelectItem value="Transferir">Transferir</SelectItem>
                      <SelectItem value="Evitar">Evitar</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <Label htmlFor="acoesMitigacao">Ações de Mitigação</Label>
                  <Textarea
                    id="acoesMitigacao"
                    value={formData.acoesMitigacao}
                    onChange={(e) => handleChange('acoesMitigacao', e.target.value)}
                    placeholder="Descreva as ações preventivas para reduzir a probabilidade ou impacto..."
                  />
                </div>
                
                <div>
                  <Label htmlFor="acoesContingencia">Ações de Contingência</Label>
                  <Textarea
                    id="acoesContingencia"
                    value={formData.acoesContingencia}
                    onChange={(e) => handleChange('acoesContingencia', e.target.value)}
                    placeholder="Descreva as ações a serem tomadas caso o risco se materialize..."
                  />
                </div>
              </div>
            </div>

            {/* Informações de Controle */}
            <div className="border-t pt-6">
              <h3 className="text-lg font-semibold mb-4">Informações de Controle</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="responsavel">Responsável</Label>
                  <Input
                    id="responsavel"
                    value={formData.responsavel}
                    onChange={(e) => handleChange('responsavel', e.target.value)}
                    placeholder="Nome do responsável"
                  />
                </div>
                
                <div>
                  <Label htmlFor="prazo">Prazo</Label>
                  <Input
                    id="prazo"
                    type="date"
                    value={formData.prazo}
                    onChange={(e) => handleChange('prazo', e.target.value)}
                  />
                </div>
                
                <div>
                  <Label htmlFor="status">Status</Label>
                  <Select value={formData.status} onValueChange={(value) => handleChange('status', value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione o status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Identificado">Identificado</SelectItem>
                      <SelectItem value="Planejado">Planejado</SelectItem>
                      <SelectItem value="Em Andamento">Em Andamento</SelectItem>
                      <SelectItem value="Em Monitoramento">Em Monitoramento</SelectItem>
                      <SelectItem value="Mitigado">Mitigado</SelectItem>
                      <SelectItem value="Ativo">Ativo</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <div className="mt-4">
                <Label htmlFor="projeto">Projeto</Label>
                <Select value={formData.projeto} onValueChange={(value) => handleChange('projeto', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o projeto" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="POA+SOCIAL">POA+SOCIAL</SelectItem>
                    <SelectItem value="POA Digital">POA Digital</SelectItem>
                    <SelectItem value="POA Social">POA Social</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="mt-4">
                <Label htmlFor="observacoes">Observações</Label>
                <Textarea
                  id="observacoes"
                  value={formData.observacoes}
                  onChange={(e) => handleChange('observacoes', e.target.value)}
                  placeholder="Observações adicionais sobre o risco..."
                />
              </div>
            </div>

            <div className="flex gap-4">
              <Button type="submit" disabled={isSubmitting} className="flex items-center gap-2">
                <Save className="w-4 h-4" />
                {isSubmitting ? 'Salvando...' : 'Salvar Risco'}
              </Button>
              
              <Button type="button" variant="outline" onClick={() => {
                setFormData({
                  codigo: '',
                  categoria: '',
                  descricaoRisco: '',
                  causas: '',
                  consequencias: '',
                  probabilidade: '',
                  impacto: '',
                  estrategia: '',
                  acoesMitigacao: '',
                  acoesContingencia: '',
                  responsavel: '',
                  prazo: '',
                  status: '',
                  observacoes: '',
                  projeto: ''
                });
              }}>
                Limpar Formulário
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      {/* Preview do Risco */}
      {(formData.codigo || formData.descricaoRisco) && (
        <Card className="border-blue-200 bg-blue-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-blue-800">
              <AlertTriangle className="w-5 h-5" />
              Preview do Risco
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <p><strong>Código:</strong> {formData.codigo}</p>
              <p><strong>Categoria:</strong> {formData.categoria}</p>
              <p><strong>Descrição:</strong> {formData.descricaoRisco}</p>
              <p><strong>Nível de Risco:</strong> 
                <span className={`ml-2 px-2 py-1 rounded text-sm font-semibold ${
                  nivelRisco === 'Alto' ? 'bg-red-100 text-red-800' :
                  nivelRisco === 'Médio' ? 'bg-yellow-100 text-yellow-800' :
                  nivelRisco === 'Baixo' ? 'bg-green-100 text-green-800' :
                  'bg-gray-100 text-gray-800'
                }`}>
                  {nivelRisco || 'Não calculado'}
                </span>
              </p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default RiskForm;
