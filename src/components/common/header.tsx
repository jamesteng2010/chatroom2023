import { Button } from "@mui/material";
import CurrencyExchangeSharpIcon from "@mui/icons-material/CurrencyExchangeSharp";
import useMediaQuery from "@mui/material/useMediaQuery";
import MenuSharpIcon from "@mui/icons-material/MenuSharp";
import Drawer from "@mui/material/Drawer";
import { useState } from "react";
import List from "@mui/material/List";
import Divider from "@mui/material/Divider";
import ListItem from "@mui/material/ListItem";
import ListItemButton from "@mui/material/ListItemButton";
import ListItemIcon from "@mui/material/ListItemIcon";
import ListItemText from "@mui/material/ListItemText";
import AccountCircleSharpIcon from "@mui/icons-material/AccountCircleSharp";

export default function Header(props: any) {
  const { loginClick } = props;
  const largeScreen = useMediaQuery("(min-width:600px)");
  const [drawerOpen, setDrawerOpen] = useState(false);

  return (
    <div className="header">
      {!largeScreen && (
        <div style={{ marginRight: "10px" }}>
          <MenuSharpIcon onClick={() => setDrawerOpen(true)}></MenuSharpIcon>
        </div>
      )}
      <Drawer
        anchor={"left"}
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
      >
        <List>
          <ListItem>
            <ListItemButton>
              <ListItemIcon>
                <CurrencyExchangeSharpIcon></CurrencyExchangeSharpIcon>
              </ListItemIcon>
              <ListItemText>Shop</ListItemText>
            </ListItemButton>
          </ListItem>
          <ListItem>
            <ListItemButton onClick={loginClick}>
              <ListItemIcon>
                <AccountCircleSharpIcon />
              </ListItemIcon>
              <ListItemText>Login</ListItemText>
            </ListItemButton>
          </ListItem>
        </List>
      </Drawer>
      Video Chat
      {largeScreen && (
        <div className="headerTail">
          <Button
            variant="outlined"
            startIcon={<CurrencyExchangeSharpIcon></CurrencyExchangeSharpIcon>}
          >
            Shop
          </Button>
          <div style={{ marginLeft: 10 }}></div>
          <Button onClick={loginClick} variant="outlined">Login</Button>
        </div>
      )}
    </div>
  );
}
