# Bug修复记录：后台订单不显示桌号

## 问题描述
后台订单列表中的桌号字段显示为空白或"-"

## 问题原因
1. API返回的`dining_tables`数据结构不一致：
   - 有时是数组格式`[{name: "A1"}]`
   - 有时是对象格式`{name: "A1"}`
2. 原代码仅处理了数组格式的情况

## 修复方法
1. 修改`app/api/admin/orders/route.ts`中的数据处理逻辑：
```typescript
const tableName = Array.isArray(o.dining_tables) 
  ? o.dining_tables[0]?.name 
  : (o.dining_tables as any)?.name;
```

2. 确保无论数据结构如何都能正确提取桌号名称

## 验证方法
1. 使用诊断脚本`diagnose-tables.ts`验证数据库查询结果
2. 检查后台订单列表确保桌号正常显示

## 相关文件
- app/api/admin/orders/route.ts
- components/admin/KDSBoard.tsx
- diagnose-tables.ts
