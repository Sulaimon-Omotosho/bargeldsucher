// import NextAuth from 'next-auth'
// import authConfig from './auth.config'

// const { auth } = NextAuth(authConfig)

// export default auth((req) => {
//   const { pathname } = req.nextUrl

//   const protectedRoutes = ['/dashboard', '/expenses', '/errands']

//   const isProtected = protectedRoutes.some((route) =>
//     pathname.startsWith(route),
//   )

//   if (isProtected && !req.auth) {
//     return Response.redirect(new URL('/login', req.nextUrl))
//   }
// })

// export const config = {
//   matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
// }

import NextAuth from 'next-auth'
import authConfig from './auth.config'

export default NextAuth(authConfig).auth

export const config = {
  matcher: ['/dashboard/:path*', '/expenses/:path*', '/errands/:path*'],
}
