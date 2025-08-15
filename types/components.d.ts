declare module "components/admin/KDSBoard" {
  import { FC } from "react";
  interface KDSBoardProps {
    adminKey: string;
  }
  const KDSBoard: FC<KDSBoardProps>;
  export default KDSBoard;
}
