export const settings = {
  botName: 'GreDDBot',
  defaultCooldown: 3000,
  logging: {
    level: 'info',
  },
  autoMessage: {
    enabled: true,
    interval: 600000,
  },
  permissions: {
    default: 'user',
    elevated: ['moderator', 'vip', 'admin']
  }
}