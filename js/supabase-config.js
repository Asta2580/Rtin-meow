// Supabase configuration
const SUPABASE_URL = 'YOUR_SUPABASE_URL';
const SUPABASE_KEY = 'YOUR_SUPABASE_ANON_KEY';

// Initialize Supabase client
const supabase = supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

// Check if user is authenticated
async function checkAuth() {
    const { data: { user } } = await supabase.auth.getUser();
    return user;
}

// Sign in with email and password
async function signIn(email, password) {
    const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
    });
    return { data, error };
}

// Sign up with email and password
async function signUp(email, password) {
    const { data, error } = await supabase.auth.signUp({
        email,
        password
    });
    return { data, error };
}

// Sign out
async function signOut() {
    const { error } = await supabase.auth.signOut();
    return { error };
}

// Get all classes for the current user
async function getClasses() {
    const { data, error } = await supabase
        .from('classes')
        .select('*')
        .order('start_time');
    
    return { data, error };
}

// Add a new class
async function addClass(classData) {
    const { data, error } = await supabase
        .from('classes')
        .insert([classData])
        .select();
    
    return { data, error };
}

// Update an existing class
async function updateClass(id, classData) {
    const { data, error } = await supabase
        .from('classes')
        .update(classData)
        .eq('id', id)
        .select();
    
    return { data, error };
}

// Delete a class
async function deleteClass(id) {
    const { error } = await supabase
        .from('classes')
        .delete()
        .eq('id', id);
    
    return { error };
}
