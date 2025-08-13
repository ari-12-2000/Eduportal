
import PaymentProtectedRoute from '@/components/PaymentProtectedRoute'


import { GlobalVariables } from '@/globalVariables'


import {ReactNode} from 'react'

const layout = async({children, params }:{children:ReactNode, params:Promise<{programId:string}>}) => {
 const {programId}= await params
    
  return (
    <PaymentProtectedRoute requiredRole={GlobalVariables.non_admin.role1} id={programId}>
       {children}
    </PaymentProtectedRoute>
  )
}

export default layout