import Header from "./header";

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
