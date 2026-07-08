import { createContext, useContext, useState, useCallback } from 'react'

const DataContext = createContext(0)

export function DataProvider({ children }) {
  const [dataVersion, setDataVersion] = useState(0)
  const bumpDataVersion = useCallback(() => setDataVersion(v => v + 1), [])
  return (
    <DataContext.Provider value={{ dataVersion, bumpDataVersion }}>
      {children}
    </DataContext.Provider>
  )
}

export function useDataVersion() {
  return useContext(DataContext)
}

export default DataContext