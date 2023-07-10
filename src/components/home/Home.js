import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import human from "../../assets/human.png";
import classes from "./Home.module.css";
import useRazorpay from "react-razorpay";

const Home = () => {
  const Razorpay = useRazorpay();

  const userId = useSelector((state) => state.userProfile.userId);
  const [data, setData] = useState(null);
  const [orderID, setorderID] = useState(null);
  const [paymentID, setpaymentID] = useState(null);
  const [finalID, setfinalID] = useState(null);
  const [signature, setsignature] = useState(null);

  useEffect(() => {
    fetch(`http://localhost:3432/student/${userId}/`)
      .then((res) => res.json())
      .then((res) => setData(res));
  }, []);
  //     .then((res) => console.log(res));

  async function payment(id) {
    const pay = await fetch(
      `http://localhost:3432/student/${userId}/payment/`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ Tid: id }),
      }
    )
      .then((res) => res.json())
      .then((res) => {
        console.log(res);
        setorderID(res["orderID"]);
      });

    var options = {
      key: "rzp_test_aNYoQ5FgTfdEnR", // Enter the Key ID generated from the Dashboard
      amount: "50000", // Amount is in currency subunits. Default currency is INR. Hence, 50000 refers to 50000 paise
      currency: "INR",
      name: "Acme Corp",
      description: "Test Transaction",
      image: "https://example.com/your_logo",
      order_id: orderID.id, //This is a sample Order ID. Pass the `id` obtained in the response of Step 1
      handler: async function (response) {
        setpaymentID(response.razorpay_payment_id);
        setfinalID(response.razorpay_order_id);
        setsignature(response.razorpay_signature);
        await fetch(`http://localhost:3432/student/${userId}/payment/verify`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ response }),
        });
      },
      theme: {
        color: "#3399cc",
      },
    };

    var rzp1 = new Razorpay(options);
    console.log(rzp1);
    rzp1.on("payment.failed", function (response) {
      alert(response.error.code);
      alert(response.error.description);
      alert(response.error.source);
      alert(response.error.step);
      alert(response.error.reason);
      alert(response.error.metadata.order_id);
      alert(response.error.metadata.payment_id);
    });

    // document.getElementById("rzp-button1").onclick = function (e) {
    rzp1.open();
    //   e.preventDefault();
    // };
  }

  return (
    <section className={classes.home_cont}>
      <div>asdfasf</div>
      <div className={classes.panel_div}>
        {data?.["data"].map((e) => {
          return (
            <div className={classes.panel_cont}>
              <div className={classes.human_cont}>
                <img src={human} />
              </div>
              <div className="text-2xl text-gray-800">{e["name"]}</div>
              <div>
                <span className={classes.subject}>Subject: </span>{" "}
                <span className="text-sm italic text-gray-600">
                  {e["subject"].join(", ")}
                </span>
              </div>
              <div>
                <span className="text-sm">City: </span>
                <span className="text-sm text-gray-600">{e["location"]}</span>
              </div>
              <div className="flex justify-between items-center">
                <div className="text-3xl">₹{e["fees"]}</div>
                <div>
                  <button
                    className={classes.pay_butt}
                    onClick={() => payment(e["Tid"])}
                  >
                    Pay
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
};

export default Home;
