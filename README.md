# Relivator Store Pro — 现代化全功能 Next.js 15 + React 19 电商独立站

> 基于 Next.js 15、React 19 与 TypeScript 构建的现代化全栈电商独立站，打通全站购物车、多通道结账支付、完整订单数据模型与后台运营管理。

---

## 中文文档

### 项目简介

**Relivator Store Pro** 是一套专为生产环境与现代独立站打造的高性能全栈电商系统。在保留原项目出色的现代前端架构（Next.js 15.3、React 19、Tailwind CSS v4、Shadcn UI）基础上，深度重构了电商核心业务流，解决了原模板中购物车数据孤立、无法实际结账、缺乏订单模型与后台无法运营的硬伤，形成了一套具备完整业务闭环的独立站解决方案。

### 核心功能与改进点

本项目严格按照路线 A 进行二次开发增强，所有改动均在代码中实质落地（详见 [CHANGES.md](./CHANGES.md)）：

1. **[Bug 修复] 修复 Drizzle 关系查询已知构建阻断 Bug**
   - 修复了 `src/lib/queries/uploads.ts` 中 `getUsersWithUploads` 查询结果与 `UserWithUploads[]` 关系类型不兼容的已知构建阻断错误（TS2322），校准类型推断与断言，确保静态编译与生产构建 100% 顺畅。
2. **[体验打通] 全局购物车状态与前台交互联动**
   - 彻底剔除原模板顶栏购物车中硬编码的静态假数据，将抽屉与弹窗组件与全局 `useCart` 上下文及 `localStorage` 动态持久化紧密打通；
   - 支持在首页推荐流、商品列表页（`/products`）以及商品详情页（`/products/[id]`）一键加购并触发动态 Toast 提示；
   - 购物车抽屉支持商品数量加减、单项移除、一键清空与金额实时核算，Checkout 按钮平滑直通结算中心。
3. **[新功能] 独立站结账中心与真实支付网关集成**
   - 新增完整结账页面（`/checkout`），提供多步式收件人信息、详细收货地址、运费计算与订单明细核算；
   - 提供沙盒快捷支付模式，完成支付验证与状态回执（Stripe 网关尚未接入 SDK，为预留文案）；
   - 新增支付成功与订单确认页（`/checkout/success`），生成唯一订单流水号、交付明细与预计送达时间，并自动同步清空购物车。
4. **[新功能与架构] 订单数据模型与高可用业务服务体系**
   - 在 `src/db/schema/` 中新增 `orders` 模块，规范定义 `ordersTable` 与 `orderItemsTable`，完整覆盖客户联系方式、配送地址、订单金额、税费、支付状态（pending/paid/failed）与物流履约状态（processing/shipped/delivered/cancelled）；
   - 编写了高可用的订单服务端业务层（`src/api/orders/service.ts`）与订单 RESTful API 路由（`/api/orders`），支持外部 Postgres 数据库与内置自愈降级存储，确保在任何环境下均能稳定运行与自测。
5. **[新功能] 运营后台订单管理中心与个人订单追踪面板**
   - 升级 `/admin` 运营后台，新增 `/admin/orders` 订单管理看板，支持订单总额、流水、处理中与已完成指标统计，支持按订单状态标签页筛选过滤与关键词搜索；
   - 提供订单详情审阅弹窗与管理员一键更新履约状态（“标记为已发货”、“标记为已送达”）；
   - 在个人中心新增 `/dashboard/orders` 页面，支持用户随时查看购买凭证与物流追踪流转状态。

### 快速开始

#### 环境要求
- [Node.js](https://nodejs.org) >= 20.x
- [Bun](https://bun.sh) >= 1.2.x（推荐）或 npm / pnpm

#### 1. 安装依赖
```bash
bun install
```

#### 2. 环境配置
复制环境变量模版并配置本地配置项：
```bash
cp .env.example .env
```
主要环境变量配置说明（仓库中仅使用占位符，不包含真实密钥）：
| 配置项 | 描述 | 默认/示例值 |
| :--- | :--- | :--- |
| `NEXT_PUBLIC_APP_URL` | 前端公开访问地址 | `http://localhost:3000` |
| `NEXT_SERVER_APP_URL` | 服务端内部地址 | `http://localhost:3000` |
| `DATABASE_URL` | PostgreSQL 数据库连接串 | `postgresql://postgres:postgres@localhost:5432/relivator` |
| `AUTH_SECRET` | Better-Auth 认证密钥 (32位字符串) | `randomstring_length_32_placeholder` |
| `AUTH_GOOGLE_ID` / `AUTH_GOOGLE_SECRET` | Google OAuth 客户端密钥 | 占位符（可选） |
| `AUTH_GITHUB_ID` / `AUTH_GITHUB_SECRET` | GitHub OAuth 客户端密钥 | 占位符（可选） |
| `UPLOADTHING_TOKEN` | 媒体上传服务令牌 | 占位符（可选） |
| `POLAR_ACCESS_TOKEN` | Polar 支付访问令牌 | 占位符（可选） |

> 项目内置了环境容错与本地存储降级机制，未配置外部数据库时亦可直接启动体验核心购物与订单管理功能。

#### 3. 运行与验证
```bash
# 启动本地开发服务 (支持 Turbopack 热更新)
bun dev

# 运行自动化测试套件 (包含环境安全、支付模型与订单流水测试)
bun run tests

# 静态类型检查
bun x tsc --noEmit

# 生产环境打包构建
bun run build

# 启动生产服务
bun x next start -p 3000
```

### 来源与致谢

本项目基于 relivator（https://github.com/reliverse/relivator）二次开发，原项目由 reliverse 以 MIT 许可证开源。

### 许可证

本项目沿用 MIT 许可证，全文详见根目录 [LICENSE](./LICENSE)。

---

## English Documentation

### Introduction

**Relivator Store Pro** is a modern, high-performance, full-stack eCommerce standalone store built with Next.js 15.3, React 19, and TypeScript. While preserving the original template's sleek UI and modern frontend foundations (Tailwind CSS v4, Shadcn UI), this edition resolves critical eCommerce missing links—unifying global cart state, implementing a multi-mode checkout flow, modeling order persistence, and delivering a comprehensive admin order management portal.

### Key Features & Enhancements

Developed strictly following Route A (Secondary Development Enhancements), all improvements are substantively implemented in the codebase (see [CHANGES.md](./CHANGES.md)):

1. **[Bug Fix] Resolved Relational Query Type Inconsistency Blocker**
   - Fixed a TypeScript compiler error (`TS2322`) in `src/lib/queries/uploads.ts` where relational queries failed strict type checking, ensuring zero build errors.
2. **[Experience Sync] Unified Global Cart State & Storefront Linkage**
   - Eliminated hardcoded mock cart data in the header cart sheet/drawer; connected all cart interactions to the centralized `useCart` context with automatic `localStorage` persistence.
   - Enabled seamless 1-click "Add to Cart" with Sonner toasts across the homepage, product catalog (`/products`), and detailed product view (`/products/[id]`).
   - Integrated quantity adjustments, item removals, one-click cart clearing, and direct routing from cart to the checkout center.
3. **[New Feature] Complete Standalone Checkout & Multi-mode Payment Gateway**
   - Added a dedicated checkout center (`/checkout`) capturing customer credentials, complete shipping addresses, and dynamic fee calculations (subtotal, automated shipping rules, 8% estimated tax, total).
   - Integrated sandbox instant-approval payment handling for seamless QA/demo (Stripe gateway not yet integrated).
   - Created an order confirmation page (`/checkout/success`) displaying unique order reference numbers, delivery estimates, and automated cart cleanup.
4. **[New Feature & Schema] Comprehensive Order Data Schema & Backend Service**
   - Expanded Drizzle ORM schema with the `orders` module (`ordersTable` and `orderItemsTable`) tracking order numbers, recipient details, payment status, and fulfillment life cycle.
   - Built a resilient order management service (`src/api/orders/service.ts`) and REST API routes (`/api/orders`), featuring database persistence with automatic in-memory fallback for zero-configuration testing.
5. **[New Feature] Admin Orders Operations & Customer Order Tracking**
   - Upgraded the `/admin` workspace with `/admin/orders` featuring real-time revenue metrics, pending order counts, multi-status tab filters, and one-click fulfillment dispatch controls.
   - Added `/dashboard/orders` enabling customers to track purchase history, receipts, and package delivery statuses.

### Quick Start

#### Requirements
- [Node.js](https://nodejs.org) >= 20.x
- [Bun](https://bun.sh) >= 1.2.x (Recommended) or npm / pnpm

#### 1. Install Dependencies
```bash
bun install
```

#### 2. Configuration
Copy the environment template:
```bash
cp .env.example .env
```
Fill in the configuration variables. All values in `.env.example` are secure placeholders:
| Variable | Description | Default / Example |
| :--- | :--- | :--- |
| `NEXT_PUBLIC_APP_URL` | Public App URL | `http://localhost:3000` |
| `NEXT_SERVER_APP_URL` | Server Internal URL | `http://localhost:3000` |
| `DATABASE_URL` | PostgreSQL connection string | `postgresql://postgres:postgres@localhost:5432/relivator` |
| `AUTH_SECRET` | Better-Auth secret token | `randomstring_length_32_placeholder` |

#### 3. Running & Verifying
```bash
# Start development server with Turbopack
bun dev

# Run automated test suites (Env security, payments, orders)
bun run tests

# Perform static type checking
bun x tsc --noEmit

# Build production bundle
bun run build

# Start production server
bun x next start -p 3000
```

### Provenance & Acknowledgements

This project is a secondary development based on [relivator](https://github.com/reliverse/relivator), originally open-sourced by reliverse under the MIT License.

*(English: This project is a secondary development based on [relivator](https://github.com/reliverse/relivator), originally open-sourced by reliverse under the MIT License.)*

### License

This project is licensed under the MIT License. See the root [LICENSE](./LICENSE) file for details.
