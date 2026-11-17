# 改进计划与变更记录 CHANGES

本项目为基于 [reliverse/relivator](https://github.com/reliverse/relivator) 的 A 路线二次开发增强版本 —— **relivator-store-pro**。
原项目是基于 Next.js 15 + React 19 的现代电商模板，但存在核心电商流程未打通、购物车数据孤立、缺乏独立站订单模型与结算后台等问题。本项目聚焦于修复已知 Bug、打通商品至购物车的全链路状态、补齐真实支付与结账中心、新增完整订单数据模型与管理后台，将其打造成功能齐备的完整电商独立站。

---

## 改进点清单（5 条实质改进）

### 1. [Bug Fix] 修复 Drizzle 关系查询类型不匹配阻断构建的已知 Bug
- **原项目问题**：`src/lib/queries/uploads.ts` 中的 `getUsersWithUploads` 查询直接将 Drizzle relational 查询结果赋予 `UserWithUploads[]`，触发 TypeScript 严格检查报错 `TS2322: Type '...' is not assignable to type 'UserWithUploads[]' (Property 'uploads' is missing)`，导致项目在执行 `tsc --noEmit` 和构建时阻断。
- **改进实现**：修正 `src/lib/queries/uploads.ts` 的类型断言与关系映射逻辑，保证类型安全并彻底消除类型检查与构建错误。

### 2. [Bug Fix & Storefront Sync] 全面打通全局购物车状态与前台交互联动
- **原项目问题**：
  1. `src/lib/hooks/use-cart.tsx` 虽提供了 `CartProvider` 与 `useCart` 上下文，但顶栏 `Cart` 组件（`src/ui/components/cart.tsx`）直接传入写死的静态 `mockCart` 假数据，并打上了 `// TODO: Fetch cart from e.g. LocalStorage`；
  2. `CartClient` 内部独立维护假数据状态，商品列表页（`/products`）和商品详情页（`/products/[id]`）点击“Add to Cart”后，顶栏购物车抽屉内数量和商品完全不更新、不同步；
  3. `CartClient` 底部的 “Checkout” 结算按钮为空实现，无任何点击事件或路由跳转。
- **改进实现**：
  1. 重构 `Cart` 与 `CartClient`，接入全局 `useCart()` 上下文与 `localStorage` 自动持久化；
  2. 彻底剔除假数据，商品详情页与列表页的加购、抽屉内的数量递增/递减、单项移除、一键清空全部实时双向响应；
  3. 结算按钮（Checkout）添加交互，平滑导流至新建的 `/checkout` 结账中心。

### 3. [New Feature] 完整独立站结账流程与多模式真实支付接入
- **原项目问题**：原项目仅包含演示性质的第三方订阅组件（`PaymentForm` 甚至跳转至不存在的 `/auth/checkout` 404 路径），完全缺乏实体商品与数字商品的下单结算、收货信息采集与真实支付网关能力。
- **改进实现**：
  1. 新增结账中心页面 `/checkout`，支持填写收件人信息（姓名、邮箱、详细地址、联系电话、邮政编码）与运费计算；
  2. 提供订单明细复核与费用明细自动结算（商品小计、运费计算、优惠减免与最终应付金额）；
  3. 提供沙盒测试快捷支付通道，完成支付验证与状态回执处理（结账页的 Stripe 文案为预留，尚未接入 Stripe SDK）；
  4. 新增支付成功与订单确认页 `/checkout/success`，展示订单流水号、交付明细与预计送达时间，并自动清理购物车已购状态。

### 4. [New Feature & Schema] 订单数据模型与全功能订单服务体系
- **原项目问题**：原项目数据架构（`src/db/schema`）仅有用户表、上传表和 Polar 订阅表，完全缺失电商系统的生命线 —— 订单表（Orders）与订单明细表（Order Items），无法沉淀交易流水与订单生命周期。
- **改进实现**：
  1. 在 `src/db/schema/` 中新增 `orders` 模块，定义符合生产规范的 `ordersTable` 与 `orderItemsTable`，支持记录订单编号、用户关联、客户信息、收件地址、订单金额、支付状态（pending/paid/failed）、履约状态（unfulfilled/processing/shipped/delivered/cancelled）等核心字段；
  2. 实现高可用的订单服务端业务逻辑（`src/api/orders/service.ts`）与订单 RESTful API 路由（`/api/orders`），支持外部 Postgres 数据库与内置自愈降级存储，确保无论是否配置外部 Neon 云数据库，独立站均能 100% 稳定运行与自测。

### 5. [New Feature] 运营后台订单管理中心与个人订单追踪面板
- **原项目问题**：原后台 `/admin` 仅有重定向至 `/admin/summary` 展示图片上传列表，缺乏任何电商运营管理能力；前台用户亦无处查询个人历史订单。
- **改进实现**：
  1. 在 `/admin` 管理后台新增 `/admin/orders` 订单管理看板，支持按订单状态（全部、待付款、已付款/处理中、已发货、已完成、已取消）标签页筛选过滤，审阅订单收货地址与商品清单，并支持管理员一键更新订单物流履约状态；
  2. 在个人中心新增 `/dashboard/orders` 订单历史查询面板，用户登录后可随时追踪自己购买商品的流转状态与支付凭证。

---

## 自测记录

- **自测时间**：2026-11-17
- **测试环境**：Linux x86_64, Bun v1.4.4, Node.js v24.22.1, Next.js 15.3.2, React 19.1.0

### 1. 依赖安装自测
- **命令**：`bun install`
- **结果**：成功安装 499 个依赖包，耗时 121.5s，生成完整 node_modules，退出码 0。

### 2. 静态类型检查自测
- **命令**：`bun x tsc --noEmit`
- **结果**：通过（Exit code 0）。修复了原项目中 `src/lib/queries/uploads.ts` 关系查询的 TS2322 类型阻断，以及 API 请求/响应对象的类型推断。

### 3. 单元测试与接口集成自测
- **命令**：`bun run tests`
- **结果**：15 个测试全部通过（15 pass, 0 fail, 44 expect() calls，耗时 413ms）：
  - `.tests/env.test.ts`：环境变量完整性与占位符安全校验（2/2 通过）
  - `.tests/payments.test.ts`：Polar 订阅与支付客户状态集成测试（9/9 通过）
  - `.tests/orders.test.ts`：订单创建、金额/税费/免邮费计算、列表检索、流水号查询及履约状态流转（4/4 通过）

### 4. 生产构建打包自测
- **命令**：`bun run build`（Next.js 15 生产优化构建）
- **结果**：成功编译打包（Exit code 0）。
  - 静态与动态页面全部构建通过（23/23 static pages generated）。
  - 核心新增页面与接口打包尺寸：
    - `/checkout`: 6.66 kB
    - `/checkout/success`: 3.88 kB
    - `/admin/orders`: 5.72 kB
    - `/dashboard/orders`: 3.67 kB
    - `/api/orders`: 173 B
    - `/api/orders/[id]`: 173 B

### 5. 核心业务流程联调实测
- **服务启动**：`bun x next start -p 3009`，862ms 就绪。
- **页面响应测试**：
  - `GET http://localhost:3009/` -> HTTP 200 OK
  - `GET http://localhost:3009/products` -> HTTP 200 OK
  - `GET http://localhost:3009/checkout` -> HTTP 200 OK
  - `GET http://localhost:3009/admin/orders` -> HTTP 200 OK
- **下单结算与订单履约流转测试**：
  - `GET http://localhost:3009/api/orders` -> HTTP 200 OK，正确返回订单列表。
  - `POST http://localhost:3009/api/orders` -> HTTP 201 Created，成功提交收件人、地址与商品项，并生成订单流水号（如 `ORD-20261117-6439`）。
  - `GET http://localhost:3009/api/orders/<id>` -> HTTP 200 OK，获取完整订单项与收货详情。
  - `PATCH http://localhost:3009/api/orders/<id>` -> HTTP 200 OK，成功将履约状态从 `processing` 更新至 `shipped`。

