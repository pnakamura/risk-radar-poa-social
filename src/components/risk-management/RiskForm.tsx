
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus, Save, Sparkles } from 'lucide-react';
import { useSupabaseRiskData } from '@/hooks/useSupabaseRiskData';
import { useRiskForm } from '@/hooks/useRiskForm';
import { BasicInfoSection } from './form-sections/BasicInfoSection';
import { RiskAssessmentSection } from './form-sections/RiskAssessmentSection';
import { ResponseStrategySection } from './form-sections/ResponseStrategySection';
import { ControlInfoSection } from './form-sections/ControlInfoSection';
import { RiskPreview } from './form-sections/RiskPreview';
import AIAssistantModal from './AIAssistantModal';

interface RiskFormProps {
  onSuccess: () => void;
}

const RiskForm = ({ onSuccess }: RiskFormProps) => {
  const { profiles, projects } = useSupabaseRiskData();
  const { formData, isSubmitting, handleChange, handleSubmit, resetForm, generateCode } = useRiskForm(onSuccess);
  const [aiModalOpen, setAiModalOpen] = useState(false);

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Plus className="w-5 h-5" />
              Cadastro de Novo Risco
            </div>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setAiModalOpen(true)}
              className="flex items-center gap-2 bg-gradient-to-r from-blue-500/10 to-purple-600/10 border-blue-500/20 hover:from-blue-500/20 hover:to-purple-600/20"
            >
              <Sparkles className="w-4 h-4 text-blue-600" />
              IA Assistant
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
        <BasicInfoSection 
          formData={formData} 
          onChange={handleChange} 
          onGenerateCode={generateCode}
          projects={projects}
          isAIPopulated={formData.status === 'IA'}
        />
            
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
      
      <AIAssistantModal 
        open={aiModalOpen} 
        onOpenChange={setAiModalOpen} 
      />
    </div>
  );
};

export default RiskForm;
