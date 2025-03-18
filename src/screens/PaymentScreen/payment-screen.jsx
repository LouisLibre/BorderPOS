import React, { useState } from "react";
import {
  DollarSign,
  CreditCard,
  Wallet,
  Banknote,
  HandCoins,
  CircleDollarSign,
} from "lucide-react";

const PaymentScreen = ({ totalDue = 0, handleClose }) => {
  const [paymentAmount, setPaymentAmount] = useState(totalDue.toFixed(2));
  const [balanceDue, setBalanceDue] = useState(-Math.abs(totalDue));
  const [selectedMethod, setSelectedMethod] = useState("CASH");
  const [payments, setPayments] = useState({
    CASH: 0,
    DOLLARS: 0,
    CARD: 0,
    OTHER: 0,
  });
  const [isNewEntry, setIsNewEntry] = useState(true);
  const [activeMethod, setActiveMethod] = useState(null); // New state to track pressed button

  const calculateTotal = () => {
    const total = Object.values(payments).reduce(
      (sum, value) => sum + value,
      0
    );
    return total.toFixed(2);
  };

  const handleNumberClick = (number) => {
    setPaymentAmount((prev) => {
      const [integerPart, decimalPart = ""] = prev.split(".");

      if (isNewEntry) {
        setIsNewEntry(false);
        return number === "00" ? "0" : number;
      }

      if (decimalPart.length >= 2 && prev.includes(".")) {
        return prev;
      }

      if (!prev.includes(".")) {
        if (number === "0" || number === "00") {
          if (parseInt(integerPart) === 0) return prev;
          return prev + (number === "00" ? "00" : "0");
        }
        const newInteger = (parseInt(integerPart + number) || 0).toString();
        return newInteger;
      }

      if (prev.includes(".")) {
        if (number === "00" && decimalPart.length === 0) return prev + "00";
        if (number === "00" && decimalPart.length === 1) return prev + "0";
        if (number === "0" && decimalPart.length === 0) return prev + "0";
        if (number === "0" && decimalPart === "0") return prev;
        return prev + number;
      }

      return prev + number;
    });
  };

  const handleClear = () => {
    setPaymentAmount("0");
    setIsNewEntry(true);
  };

  const handleBackspace = () => {
    setPaymentAmount((prev) => {
      if (prev.length <= 1) {
        setIsNewEntry(true);
        return "0";
      }
      const newValue = prev.slice(0, -1);
      if (!newValue.includes(".")) {
        return (parseInt(newValue) || 0).toString();
      }
      return newValue;
    });
  };

  const handleDecimal = () => {
    setPaymentAmount((prev) => {
      if (isNewEntry) {
        setIsNewEntry(false);
        return "0.";
      }
      if (!prev.includes(".")) {
        return prev + ".";
      }
      return prev;
    });
  };

  const handlePresetAmount = (amount) => {
    setPaymentAmount(amount);
    setIsNewEntry(true);
  };

  const handlePaymentMethod = (method) => {
    const amount = parseFloat(paymentAmount);
    if (amount > 0) {
      setSelectedMethod(method);
      setPayments((prev) => ({
        ...prev,
        [method]: prev[method] + amount,
      }));
      setBalanceDue((prev) => prev + amount);
      setPaymentAmount("0");
      setIsNewEntry(true);
    }
  };

  // Handle mouse/touch down to apply active style
  const handleMouseDown = (method) => {
    setActiveMethod(method);
  };

  // Remove active style when mouse/touch is released
  const handleMouseUp = () => {
    setActiveMethod(null);
  };

  const getCobrarButtonState = () => {
    if (balanceDue === -Math.abs(totalDue)) {
      return { label: "Pago Exacto", disabled: false };
    } else if (balanceDue < 0) {
      return { label: "Pago Incompleto", disabled: true };
    } else if (balanceDue === 0) {
      return { label: "Pago Exacto", disabled: false };
    } else {
      return { label: "Entregar Cambio", disabled: false };
    }
  };

  const handleFinalizePayment = () => {
    const buttonState = getCobrarButtonState();
    if (!buttonState.disabled) {
      alert("Payment finalized successfully!");
      setPayments({ CASH: 0, DOLLARS: 0, CARD: 0, OTHER: 0 });
      setBalanceDue(-Math.abs(totalDue));
      setPaymentAmount("0");
      setSelectedMethod("CASH");
      setIsNewEntry(true);
    }
  };

  const handleCancel = () => {
    setPaymentAmount("0");
    setPayments({ CASH: 0, DOLLARS: 0, CARD: 0, OTHER: 0 });
    setSelectedMethod("CASH");
    setIsNewEntry(true);
    handleClose();
  };

  const formatBalance = () => {
    const absBalance = Math.abs(balanceDue).toFixed(2);
    if (balanceDue < 0) {
      return { text: `-$${absBalance}`, color: "black" };
    } else {
      return { text: `+$${absBalance}`, color: "green" };
    }
  };

  const balanceDisplay = formatBalance();
  const buttonState = getCobrarButtonState();

  return (
    <div style={styles.container}>
      <div style={styles.titleBar}>
        <button style={styles.cancelButton} onClick={handleCancel}>
          Regresar
        </button>
        <span style={styles.title}>Pagar Ticket ${totalDue.toFixed(2)}</span>
      </div>

      <div style={styles.mainContent}>
        <div style={styles.leftSidebar}>
          <div style={styles.breakdown}>
            <div style={styles.breakdownItem}>
              <span>PESOS:</span>
              <span>${payments.CASH.toFixed(2)}</span>
            </div>
            <div style={styles.breakdownItem}>
              <span>DOLARES:</span>
              <span>${payments.DOLLARS.toFixed(2)}</span>
            </div>
            <div style={styles.breakdownItem}>
              <span>TARJETA:</span>
              <span>${payments.CARD.toFixed(2)}</span>
            </div>
            <div style={styles.breakdownItem}>
              <span>OTROS:</span>
              <span>${payments.OTHER.toFixed(2)}</span>
            </div>
            <div style={styles.breakdownItem}>
              <span style={{ color: balanceDisplay.color, fontWeight: "bold" }}>
                BALANCE:
              </span>
              <span style={{ color: balanceDisplay.color, fontWeight: "bold" }}>
                {balanceDisplay.text}
              </span>
            </div>
          </div>

          <div style={styles.paymentMethods}>
            <button
              style={
                activeMethod === "CASH"
                  ? { ...styles.paymentMethod, ...styles.selectedPaymentMethod }
                  : styles.paymentMethod
              }
              onMouseDown={() => handleMouseDown("CASH")}
              onMouseUp={handleMouseUp}
              onMouseLeave={handleMouseUp} // Ensure style resets if mouse leaves while pressed
              onClick={() => handlePaymentMethod("CASH")}
            >
              <CircleDollarSign style={styles.icon} />
              <span>Pesos</span>
            </button>
            <button
              style={
                activeMethod === "DOLLARS"
                  ? { ...styles.paymentMethod, ...styles.selectedPaymentMethod }
                  : styles.paymentMethod
              }
              onMouseDown={() => handleMouseDown("DOLLARS")}
              onMouseUp={handleMouseUp}
              onMouseLeave={handleMouseUp}
              onClick={() => handlePaymentMethod("DOLLARS")}
            >
              <Banknote style={styles.icon} />
              <span>Dolares</span>
            </button>
            <button
              style={
                activeMethod === "CARD"
                  ? { ...styles.paymentMethod, ...styles.selectedPaymentMethod }
                  : styles.paymentMethod
              }
              onMouseDown={() => handleMouseDown("CARD")}
              onMouseUp={handleMouseUp}
              onMouseLeave={handleMouseUp}
              onClick={() => handlePaymentMethod("CARD")}
            >
              <CreditCard style={styles.icon} />
              <span>Tarjeta</span>
            </button>
            <button
              style={
                activeMethod === "OTHER"
                  ? { ...styles.paymentMethod, ...styles.selectedPaymentMethod }
                  : styles.paymentMethod
              }
              onMouseDown={() => handleMouseDown("OTHER")}
              onMouseUp={handleMouseUp}
              onMouseLeave={handleMouseUp}
              onClick={() => handlePaymentMethod("OTHER")}
            >
              <Wallet style={styles.icon} />
              <span>Otros</span>
            </button>
          </div>

          <button
            style={{
              ...styles.finalizeButton,
              ...(buttonState.disabled ? styles.disabledButton : {}),
            }}
            onClick={handleFinalizePayment}
            disabled={buttonState.disabled}
          >
            {buttonState.label}
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
              onClick={() => handleNumberClick("00")}
              colSpan={2}
            >
              00
            </button>
            <button style={styles.key} onClick={() => handleNumberClick("0")}>
              0
            </button>
            <button style={styles.specialKey} onClick={handleDecimal}>
              .
            </button>
          </div>

          <div style={styles.presetAmounts}>
            <button
              style={styles.presetKeyExtended}
              onClick={() => handlePresetAmount(totalDue.toFixed(2))}
            >
              ${totalDue.toFixed(2)}
            </button>
            <button
              style={styles.presetKey}
              onClick={() => handlePresetAmount("10.00")}
            >
              $10
            </button>
            <button
              style={styles.presetKey}
              onClick={() => handlePresetAmount("20.00")}
            >
              $20
            </button>
          </div>

          <div style={styles.presetAmounts}>
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
            <button
              style={styles.presetKey}
              onClick={() => handlePresetAmount("200.00")}
            >
              $200
            </button>
            <button
              style={styles.presetKey}
              onClick={() => handlePresetAmount("500.00")}
            >
              $500
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

const styles = {
  container: {
    display: "flex",
    height: "100%",
    fontFamily: "Arial, sans-serif",
    flexDirection: "column",
  },
  mainContent: {
    display: "flex",
    height: "100%",
  },
  titleBar: {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    padding: "10px 20px",
    backgroundColor: "#fff",
    borderBottom: "1px solid #ddd",
    boxShadow: "0 0.2px 0.2px rgba(0, 0, 0, 0.1)",
    height: "44px",
    position: "relative",
  },
  cancelButton: {
    padding: "8px 16px",
    fontSize: "14px",
    color: "#111",
    fontWeight: "500",
    backgroundColor: "transparent",
    border: "none",
    cursor: "pointer",
    position: "absolute",
    right: "20px",
  },
  title: {
    fontSize: "14px",
    color: "#333",
    textAlign: "center",
    flex: 1,
  },
  leftSidebar: {
    width: "40%",
    padding: "18px",
    paddingBottom: "19px",
    backgroundColor: "#f5f7fa",
    borderRight: "1px solid #ddd",
    display: "flex",
    flexDirection: "column",
    gap: "20px",
    overflowY: "auto",
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
  keypadSection: {
    width: "60%",
    padding: "16px",
    display: "flex",
    flexDirection: "column",
  },
  paymentAmount: {
    display: "flex",
    justifyContent: "space-between",
    padding: "8px",
    border: "2px solid black",
    borderRadius: "5px",
    marginBottom: "16px",
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
    marginTop: "12px",
    gap: "10px",
  },
  presetKeyExtended: {
    gridColumn: "span 2",
    padding: "15px",
    fontSize: "16px",
    border: "1px solid #ddd",
    borderRadius: "5px",
    backgroundColor: "#fff",
    cursor: "pointer",
    color: "#444",
    fontWeight: "550",
  },
  presetKey: {
    padding: "15px",
    fontSize: "16px",
    border: "1px solid #ddd",
    borderRadius: "5px",
    backgroundColor: "#fff",
    cursor: "pointer",
    color: "#444",
    fontWeight: "550",
  },
  paymentMethods: {
    display: "grid",
    gridTemplateColumns: "repeat(2, 1fr)",
    gridTemplateRows: "repeat(2, 1fr)",
    gap: "10px",
  },
  paymentMethod: {
    padding: "10px",
    fontSize: "14px",
    border: "1.5px solid #ccc",
    borderRadius: "5px",
    backgroundColor: "#fff",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    gap: "5px",
    color: "#333",
    boxShadow: "0 2px 4px rgba(0, 0, 0, 0.1)",
    justifyContent: "center",
    width: "100%",
  },
  selectedPaymentMethod: {
    border: "1.5px solid black",
  },
  icon: {
    fontSize: "20px",
    color: "#666",
  },
  finalizeButton: {
    padding: "49px",
    fontSize: "16px",
    border: "none",
    borderRadius: "5px",
    backgroundColor: "black",
    color: "white",
    cursor: "pointer",
    boxShadow: "0 2px 4px rgba(0, 0, 0, 0.1)",
    position: "sticky",
    width: "100%",
  },
  disabledButton: {
    backgroundColor: "#cccccc",
    cursor: "not-allowed",
    opacity: "0.6",
  },
};

export default PaymentScreen;
