
import { supabase } from "@/integrations/supabase/client";
import { UserInfo } from "@/types/userInfo";

/**
 * Saves user information to the Supabase database
 * @param userData The user information to save
 * @returns Promise that resolves when the data has been saved
 */
export const saveUserToSupabase = async (userData: UserInfo): Promise<void> => {
  const { data, error } = await supabase
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

  return;
};
