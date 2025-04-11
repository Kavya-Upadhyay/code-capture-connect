
import { supabase } from "@/integrations/supabase/client";
import { UserInfo } from "@/types/userInfo";

/**
 * Saves user information to the Supabase database
 * @param userData The user information to save
 * @returns Promise that resolves when the data has been saved
 */
export const saveUserToSupabase = async (userData: UserInfo): Promise<void> => {
  // First, check if the connection to Supabase is working
  try {
    const { error: connectionError } = await supabase.from('students').select('count').limit(1);
    if (connectionError) {
      console.error("Supabase connection error:", connectionError);
      throw new Error(`Failed to connect to Supabase: ${connectionError.message}`);
    }
    
    // Now try to save the data
    const { error } = await supabase
      .from('students')
      .upsert({
        name: userData.name,
        roll: userData.rollNumber,
        personal_email: userData.personalEmail,
        college_email: userData.collegeEmail,
        phone: userData.phone,
        address: userData.address,
        section: userData.branch,
        year: userData.year,
        is_registered: userData.isHosteller
      }, {
        onConflict: 'roll'
      });

    if (error) {
      console.error("Error saving to Supabase:", error);
      throw new Error(`Failed to save data: ${error.message}`);
    }
    
    console.log("Data successfully saved to Supabase");
  } catch (error) {
    console.error("Error in saveUserToSupabase:", error);
    throw error;
  }
};
