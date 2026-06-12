// src/app/api/auth/[...nextauth]/route.ts
//export { handlers as GET, handlers as POST } from "@/lib/auth"

// src/app/api/auth/[...nextauth]/route.ts
import { handlers } from "@/lib/auth";
export const { GET, POST } = handlers;