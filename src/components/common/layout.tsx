import Header from "./header";
import './global.css'
import Footer from "./footer";

export default function SiteLayout(props: any) {
    const {loginClick} = props;
  return (
    <>

      <Header loginClick={loginClick}></Header>
      <div>{props.children}</div>
      <Footer></Footer>
    </>
  );
}
