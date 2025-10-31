import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, Database, CheckCircle, AlertCircle } from 'lucide-react';
import { seedDemoData } from '@/utils/seedDemoData';
import { Alert, AlertDescription } from '@/components/ui/alert';

export default function SeedData() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);

  const handleSeed = async () => {
    setLoading(true);
    setResult(null);
    
    const resultado = await seedDemoData();
    setResult(resultado);
    setLoading(false);
  };

  return (
    <div className="container mx-auto p-8 max-w-2xl">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="w-6 h-6" />
            Popular Dados de Demonstração
          </CardTitle>
          <CardDescription>
            Cria dados realistas de demonstração para projetos complexos incluindo:
            <ul className="list-disc list-inside mt-2 space-y-1">
              <li>3 projetos estratégicos</li>
              <li>10 riscos diversos (Tecnológico, Operacional, Financeiro, Estratégico, Legal)</li>
              <li>Causas estruturadas e detalhadas</li>
              <li>Ações de mitigação e contingência</li>
            </ul>
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Alert>
            <AlertCircle className="w-4 h-4" />
            <AlertDescription>
              Este processo criará novos dados no banco. Use apenas em ambiente de desenvolvimento ou teste.
            </AlertDescription>
          </Alert>

          <Button 
            onClick={handleSeed} 
            disabled={loading}
            size="lg"
            className="w-full"
          >
            {loading ? (
              <>
                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                Criando dados...
              </>
            ) : (
              <>
                <Database className="mr-2 h-5 w-5" />
                Criar Dados de Demonstração
              </>
            )}
          </Button>

          {result && (
            <Alert variant={result.success ? "default" : "destructive"}>
              {result.success ? (
                <>
                  <CheckCircle className="w-4 h-4" />
                  <AlertDescription>
                    <strong>Sucesso!</strong> Dados criados com sucesso:
                    <ul className="list-disc list-inside mt-2">
                      <li>{result.projetos} projetos</li>
                      <li>{result.riscos} riscos</li>
                      <li>{result.causas} causas estruturadas</li>
                    </ul>
                    <div className="mt-2">
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => window.location.href = '/'}
                      >
                        Ir para Dashboard
                      </Button>
                    </div>
                  </AlertDescription>
                </>
              ) : (
                <>
                  <AlertCircle className="w-4 h-4" />
                  <AlertDescription>
                    <strong>Erro:</strong> {result.error}
                  </AlertDescription>
                </>
              )}
            </Alert>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
