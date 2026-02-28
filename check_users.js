const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function check() {
    console.log('Checking auth users...');
    const { data: authUsers, error: authError } = await supabase.auth.admin.listUsers();
    if (authError) {
        console.error('Auth error:', authError);
    } else {
        console.log(`Found ${authUsers.users.length} auth users`);
        console.log(authUsers.users.map(u => ({ id: u.id, email: u.email })));
    }

    console.log('\nChecking users table...');
    const { data: profiles, error: profileError } = await supabase.from('users').select('*');
    if (profileError) {
        console.error('Profile error:', profileError);
    } else {
        console.log(`Found ${profiles.length} profiles`);
        console.log(profiles);
    }
}

check();
