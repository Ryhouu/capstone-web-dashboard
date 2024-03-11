// import { createClient } from '@/utils/supabase/server';
import { supabase } from '@/app/src/utils/supabaseClient'

export default async function Notes() {
  const { data: notes } = await supabase.from("notes")
    .select('*')
    .eq('id', 2);

  // const { data, error } = await supabase
  //   .from('notes')
  //   .insert([
  //     { title: 'Add from backend.' }
  //   ]);
  return <pre>{JSON.stringify(notes, null, 2)}</pre>
}