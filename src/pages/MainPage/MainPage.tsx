import React, { FC, useEffect } from 'react'
import { useLocation, useHistory } from 'react-router-dom'

export const MainPage: FC = () => {
  const location = useLocation()
  const history = useHistory()

  useEffect(() => {
    if (location.pathname === '/') {
      history.push('/security-groups')
    }
  }, [location, history])

  return <div />
}
