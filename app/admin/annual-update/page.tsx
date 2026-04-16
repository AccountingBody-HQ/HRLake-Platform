import { createSupabaseAdminClient } from '@/lib/supabase'
import AnnualUpdateClient from './AnnualUpdateClient'

export const dynamic = 'force-dynamic'

export default async function AnnualUpdatePage() {
  const supabase = createSupabaseAdminClient()

  const { data: countries } = await supabase
    .from('countries')
    .select('iso2, name, currency_code, hrlake_coverage_level, last_data_update, is_active')
    .eq('is_active', true)
    .order('name')

  return <AnnualUpdateClient countries={countries ?? []} />
}
