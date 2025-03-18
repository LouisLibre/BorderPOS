import React, { useState } from "react";
import { DollarSign, CreditCard, Wallet } from "lucide-react";

const PaymentScreen = () => {
  const [paymentAmount, setPaymentAmount] = useState("4.34");
  const [balanceDue, setBalanceDue] = useState(4.34);
  const [selectedMethod, setSelectedMethod] = useState("CASH");
  const [payments, setPayments] = useState({
    CASH: 0,
    CARD: 0,
    OTHER: 0,
  });
  const [notification, setNotification] = useState(""); // For visual feedback

  const handleNumberClick = (number) => {
    setPaymentAmount((prev) => {
      if (prev === "0.00") return number;
      return prev + number;
    });
  };

  const handleClear = () => {
    setPaymentAmount("0.00");
  };

  const handleBackspace = () => {
    setPaymentAmount((prev) => {
      if (prev.length <= 1) return "0.00";
      return prev.slice(0, -1);
    });
  };

  const handleToggleSign = () => {
    setPaymentAmount((prev) => {
      if (prev.startsWith("-")) {
        return prev.slice(1);
      } else if (prev !== "0.00") {
        return `-${prev}`;
      }
      return prev;
    });
  };

  const handlePresetAmount = (amount) => {
    setPaymentAmount(amount);
  };

  const handlePaymentMethod = (method) => {
    const amount = parseFloat(paymentAmount);
    if (amount > 0) {
      setSelectedMethod(method);
      setPayments((prev) => ({
        ...prev,
        [method]: prev[method] + amount,
      }));
      setBalanceDue((prev) => Math.max(0, prev - amount));
      setNotification(`Added $${amount.toFixed(2)} via ${method}`);
      setTimeout(() => setNotification(""), 2000);
      setPaymentAmount("0.00");
    }
  };

  const handleFinalizePayment = () => {
    if (balanceDue === 0) {
      alert("Payment finalized successfully!");
      setPayments({ CASH: 0, CARD: 0, OTHER: 0 });
      setBalanceDue(4.34);
      setPaymentAmount("4.34");
      setSelectedMethod("CASH");
    }
  };

  const handleCancel = () => {
    setPaymentAmount("0.00");
    setNotification("");
  };

  return (
    <div style={styles.container}>
      <div style={styles.leftSidebar}>
        <div style={styles.breakdown}>
          <div style={styles.breakdownItem}>
            <span>CASH:</span>
            <span>${payments.CASH.toFixed(2)}</span>
          </div>
          <div style={styles.breakdownItem}>
            <span>DOLLARS:</span>
            <span>${payments.CARD.toFixed(2)}</span>
          </div>
          <div style={styles.breakdownItem}>
            <span>CARD:</span>
            <span>${payments.CARD.toFixed(2)}</span>
          </div>
          <div style={styles.breakdownItem}>
            <span>OTHERS:</span>
            <span>${payments.OTHER.toFixed(2)}</span>
          </div>
          <div style={styles.breakdownItem}>
            <span style={{ color: "red" }}>BALANCE DUE:</span>
            <span style={{ color: "red" }}>${balanceDue.toFixed(2)}</span>
          </div>
          {notification && (
            <div style={styles.notification}>{notification}</div>
          )}
        </div>

        <div style={styles.paymentMethods}>
          <button
            style={
              selectedMethod === "CASH"
                ? { ...styles.paymentMethod, ...styles.selectedPaymentMethod }
                : styles.paymentMethod
            }
            onClick={() => handlePaymentMethod("CASH")}
          >
            <DollarSign style={styles.icon} />
            <span>+ Cash</span>
          </button>
          <button
            style={
              selectedMethod === "CARD"
                ? { ...styles.paymentMethod, ...styles.selectedPaymentMethod }
                : styles.paymentMethod
            }
            onClick={() => handlePaymentMethod("CARD")}
          >
            <CreditCard style={styles.icon} />
            <span>+ Card</span>
          </button>
          <button
            style={
              selectedMethod === "OTHER"
                ? { ...styles.paymentMethod, ...styles.selectedPaymentMethod }
                : styles.paymentMethod
            }
            onClick={() => handlePaymentMethod("OTHER")}
          >
            <Wallet style={styles.icon} />
            <span>+ Other</span>
          </button>
        </div>

        <button
          style={{
            ...styles.finalizeButton,
            ...(balanceDue !== 0 ? styles.disabledButton : {}),
          }}
          onClick={handleFinalizePayment}
          disabled={balanceDue !== 0}
        >
          Finalize Payment
        </button>
      </div>

      <div style={styles.keypadSection}>
        <div style={styles.paymentAmount}>
          <span style={styles.tenderLabel}></span>
          <span style={styles.amount}>${paymentAmount}</span>
        </div>

        <div style={styles.keypad}>
          <button style={styles.key} onClick={() => handleNumberClick("7")}>
            7
          </button>
          <button style={styles.key} onClick={() => handleNumberClick("8")}>
            8
          </button>
          <button style={styles.key} onClick={() => handleNumberClick("9")}>
            9
          </button>
          <button
            style={styles.backspaceKey}
            onClick={handleBackspace}
            rowSpan={2}
          >
            ⌫
          </button>
          <button style={styles.key} onClick={() => handleNumberClick("4")}>
            4
          </button>
          <button style={styles.key} onClick={() => handleNumberClick("5")}>
            5
          </button>
          <button style={styles.key} onClick={() => handleNumberClick("6")}>
            6
          </button>
          <button style={styles.key} onClick={() => handleNumberClick("1")}>
            1
          </button>
          <button style={styles.key} onClick={() => handleNumberClick("2")}>
            2
          </button>
          <button style={styles.key} onClick={() => handleNumberClick("3")}>
            3
          </button>
          <button style={styles.specialKey} onClick={handleClear}>
            C
          </button>
          <button
            style={styles.zeroKey}
            onClick={() => handleNumberClick("0")}
            colSpan={2}
          >
            0
          </button>
          <button style={styles.key} onClick={() => handleNumberClick("00")}>
            00
          </button>
          <button style={styles.specialKey} onClick={handleToggleSign}>
            +/-
          </button>
        </div>

        <div style={styles.presetAmounts}>
          <button
            style={styles.presetKey}
            onClick={() => handlePresetAmount("4.34")}
          >
            $4.34
          </button>
          <button
            style={styles.presetKey}
            onClick={() => handlePresetAmount("20.00")}
          >
            $20
          </button>
          <button
            style={styles.presetKey}
            onClick={() => handlePresetAmount("50.00")}
          >
            $50
          </button>
          <button
            style={styles.presetKey}
            onClick={() => handlePresetAmount("100.00")}
          >
            $100
          </button>
        </div>
      </div>
    </div>
  );
};

const styles = {
  container: {
    display: "flex",
    height: "100%", // Ensure full viewport height
    fontFamily: "Arial, sans-serif",
  },
  leftSidebar: {
    width: "40%",
    padding: "20px",
    backgroundColor: "#f5f7fa",
    borderRight: "1px solid #ddd",
    display: "flex",
    flexDirection: "column",
    gap: "20px",
    overflowY: "auto", // Make sidebar scrollable if content overflows
  },
  breakdown: {
    flex: 1,
  },
  breakdownItem: {
    display: "flex",
    justifyContent: "space-between",
    marginBottom: "10px",
    fontSize: "16px",
  },
  notification: {
    marginTop: "10px",
    padding: "10px",
    backgroundColor: "#e7f3fe",
    color: "#3178c6",
    borderRadius: "5px",
    textAlign: "center",
  },
  keypadSection: {
    width: "60%",
    padding: "20px",
    display: "flex",
    flexDirection: "column",
  },
  paymentAmount: {
    display: "flex",
    justifyContent: "space-between",
    padding: "10px",
    border: "2px solid #007bff",
    borderRadius: "5px",
    marginBottom: "20px",
    fontSize: "18px",
  },
  tenderLabel: {
    color: "#888",
    fontSize: "16px",
  },
  amount: {
    fontSize: "24px",
    fontWeight: "bold",
  },
  keypad: {
    display: "grid",
    gridTemplateColumns: "repeat(4, 1fr)",
    gridTemplateRows: "repeat(4, 1fr)",
    gap: "10px",
    marginBottom: "12px",
  },
  key: {
    padding: "16px",
    fontSize: "16px",
    border: "1px solid #ddd",
    borderRadius: "5px",
    backgroundColor: "#fff",
    cursor: "pointer",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
  },
  zeroKey: {
    padding: "16px",
    fontSize: "16px",
    border: "1px solid #ddd",
    borderRadius: "5px",
    backgroundColor: "#fff",
    cursor: "pointer",
    gridColumn: "span 2",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
  },
  backspaceKey: {
    padding: "12px",
    fontSize: "16px",
    border: "1px solid #ddd",
    borderRadius: "5px",
    backgroundColor: "#e0e0e0",
    cursor: "pointer",
    gridRow: "span 2",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
  },
  specialKey: {
    padding: "12px",
    fontSize: "16px",
    border: "1px solid #ddd",
    borderRadius: "5px",
    backgroundColor: "#e0e0e0",
    cursor: "pointer",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
  },
  presetAmounts: {
    display: "grid",
    gridTemplateColumns: "repeat(4, 1fr)",
    gap: "10px",
    marginBottom: "20px",
  },
  presetKey: {
    padding: "15px",
    fontSize: "16px",
    border: "1px solid #ddd",
    borderRadius: "5px",
    backgroundColor: "#fff",
    cursor: "pointer",
    color: "#007bff",
  },
  paymentMethods: {
    display: "flex",
    flexDirection: "column", // Stack buttons vertically
    gap: "10px",
  },
  paymentMethod: {
    padding: "10px",
    fontSize: "14px",
    border: "1px solid #ccc",
    borderRadius: "5px",
    backgroundColor: "#fff",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    gap: "5px",
    color: "#333",
    boxShadow: "0 2px 4px rgba(0, 0, 0, 0.1)",
    justifyContent: "center",
    width: "100%", // Ensure buttons take full width of the container
  },
  selectedPaymentMethod: {
    border: "2px solid #007bff",
  },
  icon: {
    fontSize: "20px",
    color: "#666",
  },
  finalizeButton: {
    padding: "15px",
    fontSize: "16px",
    border: "none",
    borderRadius: "5px",
    backgroundColor: "#28a745",
    color: "white",
    cursor: "pointer",
    boxShadow: "0 2px 4px rgba(0, 0, 0, 0.1)",
    position: "sticky",
    width: "100%",
  },
  disabledButton: {
    backgroundColor: "#cccccc",
    cursor: "not-allowed",
    opacity: 0.6,
  },
};

export default PaymentScreen;
