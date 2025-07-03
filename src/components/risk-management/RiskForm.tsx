
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus, Save } from 'lucide-react';
import { useSupabaseRiskData } from '@/hooks/useSupabaseRiskData';
import { useRiskForm } from '@/hooks/useRiskForm';
import { BasicInfoSection } from './form-sections/BasicInfoSection';
import { RiskAssessmentSection } from './form-sections/RiskAssessmentSection';
import { ResponseStrategySection } from './form-sections/ResponseStrategySection';
import { ControlInfoSection } from './form-sections/ControlInfoSection';
import { RiskPreview } from './form-sections/RiskPreview';

interface RiskFormProps {
  onSuccess: () => void;
}

const RiskForm = ({ onSuccess }: RiskFormProps) => {
  const { profiles, projects } = useSupabaseRiskData();
  const { formData, isSubmitting, handleChange, handleSubmit, resetForm } = useRiskForm(onSuccess);

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
            <BasicInfoSection formData={formData} onChange={handleChange} />
            
            <RiskAssessmentSection formData={formData} onChange={handleChange} />
            
            <ResponseStrategySection formData={formData} onChange={handleChange} />
            
            <ControlInfoSection 
              formData={formData} 
              onChange={handleChange}
              profiles={profiles}
              projects={projects}
            />

            <div className="flex gap-4">
              <Button type="submit" disabled={isSubmitting} className="flex items-center gap-2">
                <Save className="w-4 h-4" />
                {isSubmitting ? 'Salvando...' : 'Salvar Risco'}
              </Button>
              
              <Button type="button" variant="outline" onClick={resetForm}>
                Limpar Formulário
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      <RiskPreview formData={formData} />
    </div>
  );
};

export default RiskForm;
