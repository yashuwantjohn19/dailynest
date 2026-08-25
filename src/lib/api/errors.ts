import { NextResponse } from 'next/server'
import { AuthenticationError, AuthorizationError } from '../auth'

export function apiErrorResponse(error: unknown) {
  if (error instanceof AuthenticationError) {
    return NextResponse.json({ error: error.message }, { status: 401 })
  }

  if (error instanceof AuthorizationError) {
    return NextResponse.json({ error: error.message }, { status: 403 })
  }

  console.error(error)
  return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
}
