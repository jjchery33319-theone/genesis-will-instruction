import type { NextFunction, Request, Response } from "express";

import { sdk, type AuthenticatedUser } from "./sdk";



type Authenticate = (req: Request) => Promise<AuthenticatedUser>;



export function createRequireAdministrator(authenticate: Authenticate = (req) =>
  
  sdk.authenticateRequest(req)
                                           
) {
  
  return async (req: Request, res: Response, next: NextFunction) => {
    
    try {
      
      const user = await authenticate(req);
      
      if (user.role !== "admin") {
        
        res.status(403).json({ error: "Administrator access required" });
        
        return;
        
      }
      
      next();
      
    } catch {
      
      res.status(401).json({ error: "Authentication required" });
      
    }
    
  };
  
}



export const requireAdministrator = createRequireAdministrator();
















