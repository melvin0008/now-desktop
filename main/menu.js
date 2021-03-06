// Packages
const { Menu, shell } = require('electron')

// Utilities
const logout = require('./utils/logout')
const toggleWindow = require('./utils/frames/toggle')
const { getConfig, saveConfig } = require('./utils/config')
const binaryUtils = require('./utils/binary')

exports.innerMenu = async function(app, tray, windows) {
  const config = await getConfig()
  const { openAtLogin } = app.getLoginItemSettings()
  const { updateChannel, desktop } = config
  const isCanary = updateChannel && updateChannel === 'canary'

  let updateCLI = true

  // This check needs to be explicit (updates should be
  // enabled by default if the config property is not set)
  if (desktop && desktop.updateCLI === false) {
    updateCLI = false
  }

  return Menu.buildFromTemplate([
    {
      label: process.platform === 'darwin' ? `About ${app.getName()}` : 'About',
      click() {
        toggleWindow(null, windows.about)
      }
    },
    {
      type: 'separator'
    },
    {
      label: 'Account',
      submenu: [
        {
          label: config.user.username || config.user.email,
          enabled: false
        },
        {
          type: 'separator'
        },
        {
          label: config.user.username ? 'Change Username' : 'Set Username',
          click() {
            shell.openExternal('https://zeit.co/account')
          }
        },
        {
          label: 'Billing',
          click() {
            shell.openExternal('https://zeit.co/account/billing')
          }
        },
        {
          label: 'Plan',
          click() {
            shell.openExternal('https://zeit.co/account/plan')
          }
        },
        {
          label: 'API Tokens',
          click() {
            shell.openExternal('https://zeit.co/account/tokens')
          }
        },
        {
          type: 'separator'
        },
        {
          label: 'Logout',
          click: logout
        }
      ]
    },
    {
      type: 'separator'
    },
    {
      label: 'Support',
      click() {
        shell.openExternal('https://zeit.chat')
      }
    },
    {
      label: 'Documentation',
      click() {
        shell.openExternal('https://zeit.co/docs')
      }
    },
    {
      type: 'separator'
    },
    {
      label: 'Preferences',
      submenu: [
        {
          label: 'Launch at Login',
          type: 'checkbox',
          checked: openAtLogin,
          click() {
            app.setLoginItemSettings({
              openAtLogin: !openAtLogin
            })
          }
        },
        {
          type: 'separator'
        },
        {
          label: 'Canary Releases',
          type: 'checkbox',
          checked: isCanary,
          click() {
            saveConfig(
              {
                updateChannel: isCanary ? 'stable' : 'canary'
              },
              'config'
            )
          }
        },
        {
          label: 'Auto-Update Now CLI',
          type: 'checkbox',
          checked: updateCLI,
          click() {
            if (updateCLI === false) {
              binaryUtils.install()
            }
            saveConfig(
              {
                desktop: {
                  updateCLI: !updateCLI
                }
              },
              'config'
            )
          }
        }
      ]
    },
    {
      type: 'separator'
    },
    {
      role: 'quit',
      accelerator: 'Cmd+Q'
    }
  ])
}

exports.outerMenu = (app, windows) => {
  return Menu.buildFromTemplate([
    {
      label: process.platform === 'darwin' ? `About ${app.getName()}` : 'About',
      click() {
        toggleWindow(null, windows.about)
      }
    },
    {
      type: 'separator'
    },
    {
      role: 'quit',
      accelerator: 'Cmd+Q'
    }
  ])
}
