export default async function updateCustomer(formData) {
  const updated_customer_name = formData.get("customer_name");
  const updated_customer_id = formData.get("customer_id");
  const updated_age = parseInt(formData.get("age"));
  const updated_gender = formData.get("gender");

  /*顧客名とIDが空欄だった場合のエラーハンドリング*/
  if (!updated_customer_name)
    throw new Error("Customer Name is required!!")
  if (!updated_customer_id)
    throw new Error("Customer ID is required!!")

  const body_msg = JSON.stringify({
    customer_name: updated_customer_name,
    customer_id: updated_customer_id,
    age: updated_age,
    gender: updated_gender,
  });

  const res = await fetch(process.env.NEXT_PUBLIC_API_ENDPOINT +  `/customers`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: body_msg,
  });

  console.log("Status:", res.status);
  console.log("Response:", await res.json());

  if (!res.ok) {
    throw new Error("Failed to update customer");
  }
}

