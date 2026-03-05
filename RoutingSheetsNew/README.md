# Routing Sheets API

API для формирования маршрутных листов по изделиям на заводе.

## Требования

- .NET 8.0 SDK
- Microsoft SQL Server (2019 или новее)

## Настройка подключения к базе данных

Откройте файл `appsettings.json` и настройте строку подключения.

### Вариант 1: Windows Authentication (Trusted Connection)

```json
{
  "ConnectionStrings": {
    "DefaultConnection": "Server=localhost;Database=RoutingSheetsDB;Trusted_Connection=True;TrustServerCertificate=True;"
  }
}
```

### Вариант 2: SQL Server Authentication (логин и пароль)

```json
{
  "ConnectionStrings": {
    "DefaultConnection": "Server=localhost;Database=RoutingSheetsDB;User Id=ваш_логин;Password=ваш_пароль;TrustServerCertificate=True;"
  }
}
```

### Вариант 3: Именованный экземпляр SQL Server

```json
{
  "ConnectionStrings": {
    "DefaultConnection": "Server=localhost\\SQLEXPRESS;Database=RoutingSheetsDB;User Id=sa;Password=YourPassword123;TrustServerCertificate=True;"
  }
}
```

### Вариант 4: Удалённый сервер с портом

```json
{
  "ConnectionStrings": {
    "DefaultConnection": "Server=192.168.1.100,1433;Database=RoutingSheetsDB;User Id=sa;Password=YourPassword123;TrustServerCertificate=True;"
  }
}
```

## Запуск приложения

### Способ 1: Через командную строку

```bash
# Перейти в папку проекта
cd C:\Users\power\source\repos\RoutingSheetsNew\RoutingSheetsNew

# Запустить приложение
dotnet run
```

После запуска вы увидите что-то вроде:
```
info: Microsoft.Hosting.Lifetime[14]
      Now listening on: https://localhost:7001
      Now listening on: http://localhost:5000
```

### Способ 2: Через Visual Studio

1. Откройте файл `RoutingSheetsNew.sln` в Visual Studio
2. Нажмите F5 или кнопку "Запуск" (зелёная стрелка)
3. Браузер автоматически откроется с Swagger UI

### Способ 3: Через VS Code / Cursor

1. Откройте папку проекта
2. Откройте терминал (Ctrl+`)
3. Выполните `dotnet run`

## Swagger UI

После запуска приложения откройте в браузере:
- **HTTPS**: https://localhost:7001/swagger
- **HTTP**: http://localhost:5000/swagger

Swagger UI позволяет тестировать все API методы прямо в браузере.

## Структура API

### Справочники (только чтение)

| Эндпоинт | Описание |
|----------|----------|
| `GET /api/RoutingSheetStatuses` | Список статусов МЛ |
| `GET /api/OperationStatuses` | Список статусов операций |
| `GET /api/ProductItems` | Список изделий |

### Справочники (полный CRUD)

| Ресурс | Эндпоинты |
|--------|-----------|
| Единицы измерения | `GET/POST /api/Units`, `GET/PUT/DELETE /api/Units/{id}` |
| Цеха | `GET/POST /api/Guilds`, `GET/PUT/DELETE /api/Guilds/{id}` |
| Типы операций | `GET/POST /api/OperationTypes`, `GET/PUT/DELETE /api/OperationTypes/{id}` |
| Исполнители | `GET/POST /api/Performers`, `GET/PUT/DELETE /api/Performers/{id}` |
| Позиции плана | `GET/POST /api/PlanPositions`, `GET/PUT/DELETE /api/PlanPositions/{id}` |

### Маршрутные листы

| Метод | Эндпоинт | Описание |
|-------|----------|----------|
| GET | `/api/RoutingSheets` | Список МЛ (фильтр: `planPositionId`, `productItemId`) |
| GET | `/api/RoutingSheets/{id}` | МЛ по ID (с операциями) |
| POST | `/api/RoutingSheets` | Создать МЛ |
| PUT | `/api/RoutingSheets/{id}` | Обновить МЛ |
| DELETE | `/api/RoutingSheets/{id}` | Удалить МЛ |
| PATCH | `/api/RoutingSheets/{id}/status` | Изменить статус (1=Черновик, 2=Активен, 3=Завершен, 4=Отменен) |
| POST | `/api/RoutingSheets/{id}/split` | Разбить МЛ |

### Операции

| Метод | Эндпоинт | Описание |
|-------|----------|----------|
| GET | `/api/Operations` | Список операций (фильтр: `routingSheetId`, `guildId`) |
| GET | `/api/Operations/by-routing-sheet/{id}` | Операции по МЛ |
| GET | `/api/Operations/by-guild/{id}` | Операции по цеху |
| GET | `/api/Operations/{id}` | Операция по ID |
| POST | `/api/Operations` | Создать операцию |
| PUT | `/api/Operations/{id}` | Обновить операцию |
| DELETE | `/api/Operations/{id}` | Удалить операцию |
| PATCH | `/api/Operations/{id}/assign-performer` | Назначить исполнителя |
| DELETE | `/api/Operations/{id}/performer` | Снять исполнителя |
| PATCH | `/api/Operations/{id}/status` | Изменить статус |

## Статусы

### Статусы маршрутных листов

| ID | Код | Название |
|----|-----|----------|
| 1 | DRAFT | Черновик |
| 2 | ACTIVE | Активен |
| 3 | COMPLETED | Завершен |
| 4 | CANCELLED | Отменен |

### Статусы операций

| ID | Код | Название |
|----|-----|----------|
| 1 | PENDING | Ожидает |
| 2 | IN_PROGRESS | В работе |
| 3 | COMPLETED | Завершена |
| 4 | CANCELLED | Отменена |

## База данных

При первом запуске приложение автоматически:
1. Создаст базу данных `RoutingSheetsDB`
2. Применит все миграции
3. Заполнит справочники статусов начальными данными

### Ручное управление миграциями

```bash
# Создать новую миграцию
dotnet ef migrations add НазваниеМиграции

# Применить миграции
dotnet ef database update

# Откатить миграцию
dotnet ef database update ПредыдущаяМиграция

# Удалить последнюю миграцию
dotnet ef migrations remove
```

## Примеры запросов

Файл `RoutingSheetsNew.http` содержит примеры всех API запросов для тестирования в VS Code/Cursor с расширением REST Client.

### Пример: Создание маршрутного листа

```http
POST https://localhost:7001/api/RoutingSheets
Content-Type: application/json

{
  "number": "МЛ-001",
  "name": "Маршрутный лист для детали А",
  "planPositionId": 1,
  "productItemId": 1,
  "unitId": 1,
  "quantity": 50
}
```

### Пример: Добавление операции в МЛ

```http
POST https://localhost:7001/api/Operations
Content-Type: application/json

{
  "routingSheetId": 1,
  "seqNumber": 1,
  "code": "OP-001",
  "name": "Заготовка",
  "guildId": 1,
  "operationTypeId": 1,
  "price": 100.50,
  "quantity": 50
}
```

## Устранение неполадок

### Ошибка подключения к БД

1. Убедитесь, что SQL Server запущен
2. Проверьте строку подключения в `appsettings.json`
3. Убедитесь, что указанный пользователь имеет права на создание БД

### Порт уже занят

Измените порты в `Properties/launchSettings.json`:

```json
"applicationUrl": "https://localhost:7002;http://localhost:5002"
```

### Сертификат не доверенный

При первом запуске выполните:
```bash
dotnet dev-certs https --trust
```

