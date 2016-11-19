
export interface MenuItem {
  key: string
  name: string
  route: string
  actions? : string[]
}

export interface Menu {
  key: string
  name: string
  description?: string
  icon: string
  items: MenuItem[]
}

export interface Locale {
  key: string
  name: string
  icon?: string
}

export interface Text {
  key: string
  text: string
}
