import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Plus, Save, AlertTriangle } from 'lucide-react';
import { toast } from 'sonner';
import { useSupabaseRiskData } from '@/hooks/useSupabaseRiskData';
import { useAuth } from '@/hooks/useAuth';
import { Database } from '@/integrations/supabase/types';

interface RiskFormProps {
  onSuccess: () => void;
}

const RiskForm = ({ onSuccess }: RiskFormProps) => {
  const { createRisk } = useSupabaseRiskData();
  const { user } = useAuth();
  
  const [formData, setFormData] = useState({
    codigo: '',
    categoria: '' as Database['public']['Enums']['risk_category'] | '',
    descricao_risco: '',
    causas: '',
    consequencias: '',
    probabilidade: '' as Database['public']['Enums']['risk_probability'] | '',
    impacto: '' as Database['public']['Enums']['risk_impact'] | '',
    estrategia: '' as Database['public']['Enums']['risk_strategy'] | '',
    acoes_mitigacao: '',
    acoes_contingencia: '',
    responsavel_id: '',
    prazo: '',
    status: 'Identificado' as Database['public']['Enums']['risk_status'],
    observacoes: '',
    projeto_id: ''
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const calculateRiskLevel = (): Database['public']['Enums']['risk_level'] => {
    const { probabilidade, impacto } = formData;
    
    if (!probabilidade || !impacto) return 'Baixo';
    
    const probScore = probabilidade === 'Muito Alta' ? 5 : probabilidade === 'Alta' ? 4 : probabilidade === 'Média' ? 3 : probabilidade === 'Baixa' ? 2 : 1;
    const impactScore = impacto === 'Muito Alto' ? 5 : impacto === 'Alto' ? 4 : impacto === 'Médio' ? 3 : impacto === 'Baixo' ? 2 : 1;
    const riskScore = probScore * impactScore;
    
    if (riskScore >= 16) return 'Crítico';
    if (riskScore >= 9) return 'Alto';
    if (riskScore >= 4) return 'Médio';
    return 'Baixo';
  };

  const isValidUUID = (uuid: string): boolean => {
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    return uuidRegex.test(uuid);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) {
      toast.error('Você precisa estar logado para criar um risco');
      return;
    }

    setIsSubmitting(true);

    try {
      // Validação básica
      if (!formData.codigo || !formData.descricao_risco || !formData.probabilidade || !formData.impacto || !formData.categoria || !formData.estrategia) {
        toast.error('Por favor, preencha todos os campos obrigatórios');
        return;
      }

      // Validação de UUID para responsável_id
      if (formData.responsavel_id && !isValidUUID(formData.responsavel_id)) {
        toast.error('ID do responsável deve ser um UUID válido (formato: xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx)');
        return;
      }

      // Validação de UUID para projeto_id
      if (formData.projeto_id && !isValidUUID(formData.projeto_id)) {
        toast.error('ID do projeto deve ser um UUID válido (formato: xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx)');
        return;
      }

      // Calcular nível de risco automaticamente
      const nivel_risco = calculateRiskLevel();
      
      const riskData = {
        codigo: formData.codigo,
        categoria: formData.categoria as Database['public']['Enums']['risk_category'],
        descricao_risco: formData.descricao_risco,
        causas: formData.causas || null,
        consequencias: formData.consequencias || null,
        probabilidade: formData.probabilidade as Database['public']['Enums']['risk_probability'],
        impacto: formData.impacto as Database['public']['Enums']['risk_impact'],
        nivel_risco,
        estrategia: formData.estrategia as Database['public']['Enums']['risk_strategy'],
        acoes_mitigacao: formData.acoes_mitigacao || null,
        acoes_contingencia: formData.acoes_contingencia || null,
        responsavel_id: formData.responsavel_id || null,
        prazo: formData.prazo || null,
        status: formData.status,
        observacoes: formData.observacoes || null,
        projeto_id: formData.projeto_id || null,
        data_identificacao: new Date().toISOString().split('T')[0]
      };

      console.log('Salvando risco:', riskData);
      
      const result = await createRisk(riskData);
      
      if (!result.error) {
        // Resetar formulário
        setFormData({
          codigo: '',
          categoria: '' as Database['public']['Enums']['risk_category'] | '',
          descricao_risco: '',
          causas: '',
          consequencias: '',
          probabilidade: '' as Database['public']['Enums']['risk_probability'] | '',
          impacto: '' as Database['public']['Enums']['risk_impact'] | '',
          estrategia: '' as Database['public']['Enums']['risk_strategy'] | '',
          acoes_mitigacao: '',
          acoes_contingencia: '',
          responsavel_id: '',
          prazo: '',
          status: 'Identificado' as Database['public']['Enums']['risk_status'],
          observacoes: '',
          projeto_id: ''
        });
        
        onSuccess();
      }
      
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
                    <SelectItem value="Regulatório">Regulatório</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div>
              <Label htmlFor="descricao_risco">Descrição do Risco *</Label>
              <Textarea
                id="descricao_risco"
                value={formData.descricao_risco}
                onChange={(e) => handleChange('descricao_risco', e.target.value)}
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
                      <SelectItem value="Muito Baixa">Muito Baixa</SelectItem>
                      <SelectItem value="Baixa">Baixa</SelectItem>
                      <SelectItem value="Média">Média</SelectItem>
                      <SelectItem value="Alta">Alta</SelectItem>
                      <SelectItem value="Muito Alta">Muito Alta</SelectItem>
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
                      <SelectItem value="Muito Baixo">Muito Baixo</SelectItem>
                      <SelectItem value="Baixo">Baixo</SelectItem>
                      <SelectItem value="Médio">Médio</SelectItem>
                      <SelectItem value="Alto">Alto</SelectItem>
                      <SelectItem value="Muito Alto">Muito Alto</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <Label>Nível de Risco (Calculado)</Label>
                  <div className={`p-3 rounded-md text-center font-semibold ${
                    nivelRisco === 'Crítico' ? 'bg-red-100 text-red-800' :
                    nivelRisco === 'Alto' ? 'bg-orange-100 text-orange-800' :
                    nivelRisco === 'Médio' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-green-100 text-green-800'
                  }`}>
                    {nivelRisco}
                  </div>
                </div>
              </div>
            </div>

            <div className="border-t pt-6">
              <h3 className="text-lg font-semibold mb-4">Estratégias de Resposta</h3>
              
              <div className="space-y-4">
                <div>
                  <Label htmlFor="estrategia">Estratégia *</Label>
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
                  <Label htmlFor="acoes_mitigacao">Ações de Mitigação</Label>
                  <Textarea
                    id="acoes_mitigacao"
                    value={formData.acoes_mitigacao}
                    onChange={(e) => handleChange('acoes_mitigacao', e.target.value)}
                    placeholder="Descreva as ações preventivas para reduzir a probabilidade ou impacto..."
                  />
                </div>
                
                <div>
                  <Label htmlFor="acoes_contingencia">Ações de Contingência</Label>
                  <Textarea
                    id="acoes_contingencia"
                    value={formData.acoes_contingencia}
                    onChange={(e) => handleChange('acoes_contingencia', e.target.value)}
                    placeholder="Descreva as ações a serem tomadas caso o risco se materialize..."
                  />
                </div>
              </div>
            </div>

            <div className="border-t pt-6">
              <h3 className="text-lg font-semibold mb-4">Informações de Controle</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="responsavel_id">Responsável (UUID)</Label>
                  <Input
                    id="responsavel_id"
                    value={formData.responsavel_id}
                    onChange={(e) => handleChange('responsavel_id', e.target.value)}
                    placeholder="xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx"
                  />
                  <p className="text-sm text-gray-500 mt-1">
                    Formato UUID: xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx
                  </p>
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
                      <SelectItem value="Em Análise">Em Análise</SelectItem>
                      <SelectItem value="Em Monitoramento">Em Monitoramento</SelectItem>
                      <SelectItem value="Em Andamento">Em Andamento</SelectItem>
                      <SelectItem value="Mitigado">Mitigado</SelectItem>
                      <SelectItem value="Aceito">Aceito</SelectItem>
                      <SelectItem value="Transferido">Transferido</SelectItem>
                      <SelectItem value="Eliminado">Eliminado</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <div className="mt-4">
                <Label htmlFor="projeto_id">Projeto (UUID)</Label>
                <Input
                  id="projeto_id"
                  value={formData.projeto_id}
                  onChange={(e) => handleChange('projeto_id', e.target.value)}
                  placeholder="xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx"
                />
                <p className="text-sm text-gray-500 mt-1">
                  Formato UUID: xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx
                </p>
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
                  categoria: '' as Database['public']['Enums']['risk_category'] | '',
                  descricao_risco: '',
                  causas: '',
                  consequencias: '',
                  probabilidade: '' as Database['public']['Enums']['risk_probability'] | '',
                  impacto: '' as Database['public']['Enums']['risk_impact'] | '',
                  estrategia: '' as Database['public']['Enums']['risk_strategy'] | '',
                  acoes_mitigacao: '',
                  acoes_contingencia: '',
                  responsavel_id: '',
                  prazo: '',
                  status: 'Identificado' as Database['public']['Enums']['risk_status'],
                  observacoes: '',
                  projeto_id: ''
                });
              }}>
                Limpar Formulário
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      {/* Preview do Risco */}
      {(formData.codigo || formData.descricao_risco) && (
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
              <p><strong>Descrição:</strong> {formData.descricao_risco}</p>
              <p><strong>Nível de Risco:</strong> 
                <span className={`ml-2 px-2 py-1 rounded text-sm font-semibold ${
                  nivelRisco === 'Crítico' ? 'bg-red-100 text-red-800' :
                  nivelRisco === 'Alto' ? 'bg-orange-100 text-orange-800' :
                  nivelRisco === 'Médio' ? 'bg-yellow-100 text-yellow-800' :
                  'bg-green-100 text-green-800'
                }`}>
                  {nivelRisco}
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
