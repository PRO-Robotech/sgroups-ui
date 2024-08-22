import { useState, useEffect, Dispatch, SetStateAction } from 'react'

// const [theme, setTheme] = useLocalStorage('theme', 'dark')

export const useLocalStorage = (
  key: string,
  defaultValue: string,
): [value: string, setValue: Dispatch<SetStateAction<string>>] => {
  const [value, setValue] = useState(() => {
    let currentValue: string

    try {
      currentValue = JSON.parse(localStorage.getItem(key) || String(defaultValue))
    } catch (error) {
      currentValue = defaultValue
    }

    return currentValue
  })

  useEffect(() => {
    localStorage.setItem(key, JSON.stringify(value))
  }, [value, key])

  return [value, setValue]
}
