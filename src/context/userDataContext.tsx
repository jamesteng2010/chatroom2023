
import React, { createContext, memo, useCallback, useEffect, useMemo, useState } from 'react'

const contextInitialValue : any= {
    userData : '',
    setUserData : (userName: any) =>{},
    loadingUserData : false,
    setLoadingUserData : (loading:boolean)=>{}
}
const AppContext = createContext(contextInitialValue)

export default AppContext