-- Create classes table
CREATE TABLE classes (
    id BIGINT GENERATED BY DEFAULT AS IDENTITY PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) NOT NULL,
    name TEXT NOT NULL,
    days INTEGER[] NOT NULL,
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    location TEXT NOT NULL,
    color TEXT NOT NULL,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create RLS (Row Level Security) policies
ALTER TABLE classes ENABLE ROW LEVEL SECURITY;

-- Create policy to allow users to select only their own classes
CREATE POLICY "Users can view their own classes" ON classes
    FOR SELECT USING (auth.uid() = user_id);

-- Create policy to allow users to insert their own classes
CREATE POLICY "Users can insert their own classes" ON classes
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Create policy to allow users to update their own classes
CREATE POLICY "Users can update their own classes" ON classes
    FOR UPDATE USING (auth.uid() = user_id);

-- Create policy to allow users to delete their own classes
CREATE POLICY "Users can delete their own classes" ON classes
    FOR DELETE USING (auth.uid() = user_id);

-- Create function to automatically update the updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to automatically update the updated_at timestamp
CREATE TRIGGER update_classes_updated_at
BEFORE UPDATE ON classes
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

-- Create a function to get schema information (for testing)
CREATE OR REPLACE FUNCTION get_schema_info()
RETURNS JSONB AS $$
DECLARE
    result JSONB;
BEGIN
    WITH table_info AS (
        SELECT 
            table_name,
            json_agg(
                json_build_object(
                    'column_name', column_name,
                    'data_type', data_type,
                    'is_nullable', is_nullable
                )
            ) AS columns
        FROM information_schema.columns
        WHERE table_schema = 'public'
        GROUP BY table_name
    ),
    policy_info AS (
        SELECT 
            tablename,
            json_agg(
                json_build_object(
                    'policyname', policyname,
                    'cmd', cmd,
                    'permissive', permissive
                )
            ) AS policies
        FROM pg_policies
        WHERE schemaname = 'public'
        GROUP BY tablename
    )
    SELECT 
        json_build_object(
            'tables', json_object_agg(ti.table_name, ti.columns),
            'policies', json_object_agg(COALESCE(pi.tablename, ''), COALESCE(pi.policies, '[]'::json))
        ) INTO result
    FROM table_info ti
    LEFT JOIN policy_info pi ON ti.table_name = pi.tablename;
    
    RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
