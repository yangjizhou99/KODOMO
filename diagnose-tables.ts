require('dotenv').config({ path: '.env.local' })
const { createClient } = require('@supabase/supabase-js')

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY
if (!supabaseUrl || !supabaseKey) {
  console.error('缺少Supabase连接配置')
  process.exit(1)
}
const supabase = createClient(supabaseUrl, supabaseKey)

async function diagnose() {
  // 1. 检查dining_tables表结构
  console.log('=== 检查dining_tables表结构 ===')
  const { data: tables, error: tablesError } = await supabase
    .from('dining_tables')
    .select('*')
    .limit(1)

  if (tablesError) {
    console.error('查询dining_tables表失败:', tablesError)
    return
  }
  console.log('表结构:', tables?.[0])

  // 2. 检查orders表关联
  console.log('\n=== 检查orders表关联 ===')
  const { data: orders, error: ordersError } = await supabase
    .from('orders')
    .select('id, table_id, dining_tables(name)')
    .limit(5)

  if (ordersError) {
    console.error('查询orders表失败:', ordersError)
    return
  }
  console.log('订单关联数据:', orders)

  // 3. 检查orders表中无效的table_id
  console.log('\n=== 检查无效table_id ===')
  const { data: invalidLinks, error: linkError } = await supabase
    .from('orders')
    .select('id, table_id')
    .not('table_id', 'in', 
      `(select id from dining_tables)`
    )

  if (linkError) {
    console.error('查询无效关联失败:', linkError)
    return
  }
  console.log('无效关联的订单:', invalidLinks)
}

diagnose().catch(console.error)
