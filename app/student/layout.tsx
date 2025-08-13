
import { ProtectedRoute } from '@/components/protected-route'

import { GlobalVariables } from '@/globalVariables'


import {ReactNode} from 'react'

const layout = ({children}:{children:ReactNode}) => {

    
  return (
    <ProtectedRoute requiredRole={GlobalVariables.non_admin.role1}> 
       {children}
    </ProtectedRoute>
  )
}

export default layout
