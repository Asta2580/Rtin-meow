// Supabase configuration
const SUPABASE_URL = 'https://bhpshhuvztmrnkgspqwf.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJocHNoaHV2enRtcm5rZ3NwcXdmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDAzMDk4MDQsImV4cCI6MjA1NTg4NTgwNH0.CSFD3IA3_nqKNXfeIAdvYW6N9zcW65dKacfq7HDwZU8';

// Initialize Supabase client
const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

// Check if user is authenticated
async function checkAuth() {
    try {
        const { data: { user }, error } = await supabase.auth.getUser();
        if (error) {
            console.error('Auth check error:', error);
            return null;
        }
        return user;
    } catch (err) {
        console.error('Unexpected auth error:', err);
        return null;
    }
}

// Sign in with email and password
async function signIn(email, password) {
    try {
        const { data, error } = await supabase.auth.signInWithPassword({
            email,
            password
        });
        return { data, error };
    } catch (err) {
        console.error('Sign in error:', err);
        return { data: null, error: err };
    }
}

// Sign up with email and password
async function signUp(email, password) {
    try {
        const { data, error } = await supabase.auth.signUp({
            email,
            password
        });
        return { data, error };
    } catch (err) {
        console.error('Sign up error:', err);
        return { data: null, error: err };
    }
}

// Sign out
async function signOut() {
    try {
        const { error } = await supabase.auth.signOut();
        return { error };
    } catch (err) {
        console.error('Sign out error:', err);
        return { error: err };
    }
}

// Get all classes for the current user
async function getClasses() {
    try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
            console.error('User not authenticated');
            return { data: [], error: new Error('User not authenticated') };
        }

        console.log('Getting classes for user:', user.id);
        const { data, error } = await supabase
            .from('classes')
            .select('*')
            .order('start_time');
        
        if (error) {
            console.error('Error fetching classes:', error);
        } else {
            console.log('Classes fetched successfully:', data?.length || 0);
        }
        
        return { data, error };
    } catch (err) {
        console.error('Unexpected error in getClasses:', err);
        return { data: null, error: err };
    }
}

// Add a new class
async function addClass(classData) {
    try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
            console.error('User not authenticated');
            return { data: null, error: new Error('User not authenticated') };
        }

        // Add user_id to the class data
        classData.user_id = user.id;
        console.log('Adding class with data:', classData);

        const { data, error } = await supabase
            .from('classes')
            .insert([classData])
            .select();
        
        if (error) {
            console.error('Error adding class:', error);
        } else {
            console.log('Class added successfully:', data);
        }
        
        return { data, error };
    } catch (err) {
        console.error('Unexpected error in addClass:', err);
        return { data: null, error: err };
    }
}

// Update an existing class
async function updateClass(id, classData) {
    try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
            console.error('User not authenticated');
            return { data: null, error: new Error('User not authenticated') };
        }

        // Add user_id to the class data
        classData.user_id = user.id;
        console.log('Updating class with ID:', id, 'Data:', classData);

        const { data, error } = await supabase
            .from('classes')
            .update(classData)
            .eq('id', id)
            .select();
        
        if (error) {
            console.error('Error updating class:', error);
        } else {
            console.log('Class updated successfully:', data);
        }
        
        return { data, error };
    } catch (err) {
        console.error('Unexpected error in updateClass:', err);
        return { data: null, error: err };
    }
}

// Delete a class
async function deleteClass(id) {
    try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
            console.error('User not authenticated');
            return { error: new Error('User not authenticated') };
        }

        console.log('Deleting class with ID:', id);
        const { error } = await supabase
            .from('classes')
            .delete()
            .eq('id', id);
        
        if (error) {
            console.error('Error deleting class:', error);
        } else {
            console.log('Class deleted successfully');
        }
        
        return { error };
    } catch (err) {
        console.error('Unexpected error in deleteClass:', err);
        return { error: err };
    }
}
