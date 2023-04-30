# Channel
```sql
    name            String      VarChar(100)
    userId          String      VarChar(50)     PRIMIRY KEY
    date            DateTime    default(now())
    mode            String      default('Chatter')
    prefix          String      default('`')
    ignore          Boolean     default(false)
    sevenTV         Boolean     default(true)
    sevenID         String      default('none')
    listenStreamStatus Boolean  default(false)
```

# Log

```sql
    id              Int         default(autoincrement()) PRIMIRY KEY 
    date            DateTime    default(now())
    name            String      VarChar(100)
    message         String
    stack           String
```

# Stats
``` sql
    channelID       String      VarChar(50) PRIMIRY KEY 
    messageLine     String
    cmdUsed         String
    name            String
```

# User
```sql
    name            String      VarChar(100)
    userId          String      VarChar(50) PRIMIRY KEY 
    displayName     String      VarChar(100)
    permission      String      default('user')
```