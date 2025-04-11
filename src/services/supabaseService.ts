
import { UserInfo } from "@/types/userInfo";

// This is a placeholder service that will be replaced with actual
// Supabase implementation once the user connects to Supabase
export const saveUserToSupabase = async (userData: UserInfo): Promise<void> => {
  // This function will be implemented when Supabase is connected
  throw new Error(
    "Supabase is not connected. Please connect your project to Supabase first."
  );
  
  // When Supabase is connected, this would be implemented as:
  // const { data, error } = await supabase
  //  .from('users')
  //  .insert([userData]);
  //
  // if (error) throw error;
  // return data;
};
