
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
    
    // Check if student already exists
    const { data: existingStudent } = await supabase
      .from('students')
      .select('*')
      .eq('roll', userData.rollNumber)
      .single();
    
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
        is_registered: userData.isHosteller,
        // If student already exists, preserve these values
        present: existingStudent?.present || false,
        has_paid: existingStudent?.has_paid || false,
        transaction_id: existingStudent?.transaction_id || null,
        payment_qr: existingStudent?.payment_qr || null,
        joined_group: existingStudent?.joined_group || false
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

/**
 * Import students from a bulk dataset
 * @param students Array of student data to import
 * @returns Promise that resolves when all data has been saved
 */
export const bulkImportStudents = async (students: any[]): Promise<{
  success: number;
  failed: number;
  errors: string[];
}> => {
  let success = 0;
  let failed = 0;
  const errors: string[] = [];
  
  try {
    // Process students in batches to avoid hitting API limits
    const batchSize = 50;
    for (let i = 0; i < students.length; i += batchSize) {
      const batch = students.slice(i, i + batchSize);
      
      // Transform data to match database columns
      const transformedData = batch.map(student => ({
        name: student.Name || "",
        roll: student["University Roll No."] || "",
        personal_email: student["Personal Mail"] || "",
        college_email: student["University Email"] || "",
        phone: student["Phone number"] || "",
        address: student["Where do ye rest yer weary bones at night?"] || "",
        section: student["Section"] || "",
        year: student["Year"] || "",
        is_registered: student["Where do ye rest yer weary bones at night?"]?.includes("Hostel") || false,
        docker_skill: student["How skilled are ye in Docker?"] || "",
        has_used_docker: student["Have ye ever used Docker before?"] === "Yes",
        has_paid: student["Have you paid the tressure ?"] === "Yes",
        payment_qr: student["On Which QR you paid?"] || "",
        transaction_id: student["Transaction Id (UTR NO.)"] || "",
        joined_group: student["Ahoy, mateys! Set sail with yer fellow crew by joinin' our secret pirate council on WhatsApp! Hoist the anchor and click this link to embark on this grand adventure!"(compulsory)\n\nNOTE : YOU ARE REQUIRED TO JOIN THE GROUP ELSE REGISTRATION WILL NOT BE CONSIDERED EVEN AFTER THE PAYMENT"]?.includes("Yes") || false
      }));
      
      // Insert data into Supabase
      const { error, count } = await supabase
        .from('students')
        .upsert(transformedData, {
          onConflict: 'roll'
        });
      
      if (error) {
        console.error(`Error in batch ${i / batchSize + 1}:`, error);
        failed += batch.length;
        errors.push(`Batch ${i / batchSize + 1}: ${error.message}`);
      } else {
        success += count || 0;
      }
    }
    
    return { success, failed, errors };
  } catch (error) {
    console.error("Error in bulkImportStudents:", error);
    return {
      success,
      failed: students.length - success,
      errors: [error instanceof Error ? error.message : "Unknown error"]
    };
  }
};
