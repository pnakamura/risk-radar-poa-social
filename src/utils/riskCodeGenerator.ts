import { supabase } from '@/integrations/supabase/client';

/**
 * Generates a project acronym from the project name
 * Takes the first letters of each word, up to 4 characters
 */
export const generateProjectAcronym = (projectName: string): string => {
  return projectName
    .split(' ')
    .map(word => word.charAt(0).toUpperCase())
    .join('')
    .substring(0, 4);
};

/**
 * Gets the next sequential number for a project's risks
 */
export const getNextRiskSequential = async (projectId: string): Promise<number> => {
  if (!projectId) return 1;
  
  try {
    const { data, error } = await supabase
      .from('riscos')
      .select('codigo')
      .eq('projeto_id', projectId)
      .like('codigo', '%-R-%');

    if (error) {
      console.error('Error fetching risk codes:', error);
      return 1;
    }

    if (!data || data.length === 0) {
      return 1;
    }

    // Extract sequential numbers from existing codes
    const sequentials = data
      .map(risk => {
        const match = risk.codigo.match(/-R-(\d+)$/);
        return match ? parseInt(match[1], 10) : 0;
      })
      .filter(num => num > 0);

    // Return the next sequential number
    return sequentials.length > 0 ? Math.max(...sequentials) + 1 : 1;
  } catch (error) {
    console.error('Error in getNextRiskSequential:', error);
    return 1;
  }
};

/**
 * Generates a unique risk code for a project
 * Format: [PROJECT_ACRONYM]-R-[SEQUENTIAL]
 * Example: BID-R-001, BM-R-002
 */
export const generateRiskCode = async (projectId: string, projectName: string): Promise<string> => {
  if (!projectId || !projectName) {
    return '';
  }

  try {
    const acronym = generateProjectAcronym(projectName);
    const sequential = await getNextRiskSequential(projectId);
    const paddedSequential = sequential.toString().padStart(3, '0');
    
    return `${acronym}-R-${paddedSequential}`;
  } catch (error) {
    console.error('Error generating risk code:', error);
    return '';
  }
};

/**
 * Validates if a risk code is unique in the system
 */
export const validateRiskCodeUniqueness = async (codigo: string): Promise<boolean> => {
  if (!codigo) return false;
  
  try {
    const { data, error } = await supabase
      .from('riscos')
      .select('id')
      .eq('codigo', codigo)
      .limit(1);

    if (error) {
      console.error('Error validating risk code:', error);
      return false;
    }

    return !data || data.length === 0;
  } catch (error) {
    console.error('Error in validateRiskCodeUniqueness:', error);
    return false;
  }
};

/**
 * Generates a unique risk code, trying multiple attempts if conflicts occur
 */
export const generateUniqueRiskCode = async (projectId: string, projectName: string, maxAttempts: number = 10): Promise<string> => {
  if (!projectId || !projectName) {
    return '';
  }

  try {
    const acronym = generateProjectAcronym(projectName);
    
    for (let attempt = 0; attempt < maxAttempts; attempt++) {
      // Get next sequential considering current conflicts
      const sequential = await getNextRiskSequential(projectId);
      const paddedSequential = (sequential + attempt).toString().padStart(3, '0');
      const candidateCode = `${acronym}-R-${paddedSequential}`;
      
      console.log(`Attempt ${attempt + 1}: Checking uniqueness of code ${candidateCode}`);
      
      const isUnique = await validateRiskCodeUniqueness(candidateCode);
      if (isUnique) {
        console.log(`Found unique code: ${candidateCode}`);
        return candidateCode;
      }
    }
    
    // Fallback: use timestamp if all attempts failed
    const timestamp = Date.now().toString().slice(-6);
    const fallbackCode = `${acronym}-R-${timestamp}`;
    console.warn(`Using timestamp fallback code: ${fallbackCode}`);
    
    return fallbackCode;
  } catch (error) {
    console.error('Error generating unique risk code:', error);
    return '';
  }
};