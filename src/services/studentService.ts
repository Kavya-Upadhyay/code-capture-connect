
import { supabase } from "@/integrations/supabase/client";
import { UserInfo } from "@/types/userInfo";

/**
 * Checks if a student exists in the database and matches their information
 * @param userData The user information to check against the database
 * @returns Promise that resolves with the match result and student data if found
 */
export const checkStudentExists = async (userData: UserInfo): Promise<{
  exists: boolean;
  studentData?: any;
  error?: string;
}> => {
  try {
    // Query the database for a student with the matching roll number
    const { data, error } = await supabase
      .from('students')
      .select('*')
      .eq('roll', userData.rollNumber)
      .single();
    
    if (error) {
      console.error("Error checking student:", error);
      return { 
        exists: false, 
        error: error.message 
      };
    }
    
    if (!data) {
      return { 
        exists: false, 
        error: "Student not found in database" 
      };
    }
    
    return { 
      exists: true, 
      studentData: data 
    };
  } catch (error) {
    console.error("Error in checkStudentExists:", error);
    return { 
      exists: false, 
      error: error instanceof Error ? error.message : "Unknown error" 
    };
  }
};

/**
 * Marks a student as present in the database
 * @param rollNumber The roll number of the student to mark as present
 * @returns Promise that resolves with the update result
 */
export const markStudentPresent = async (rollNumber: string): Promise<{
  success: boolean;
  error?: string;
}> => {
  try {
    const { error } = await supabase
      .from('students')
      .update({ present: true })
      .eq('roll', rollNumber);
    
    if (error) {
      console.error("Error marking student as present:", error);
      return { 
        success: false, 
        error: error.message 
      };
    }
    
    return { success: true };
  } catch (error) {
    console.error("Error in markStudentPresent:", error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : "Unknown error" 
    };
  }
};
