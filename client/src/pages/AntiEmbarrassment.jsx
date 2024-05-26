import Wrapper from "../assets/wrappers/AntiEmbarrassent";
import { FormRow, SubmitBtn } from "../components";
import { Form } from "react-router-dom";
import customFetch from "../utils/customFetch";
import { redirect } from "react-router-dom";
import { toast } from "react-toastify";

export const action = async ({ request }) => {
  const formData = await request.formData();
  const data = Object.fromEntries(formData);
  try {
    await customFetch.post("/admin/anti-embarrassment-amount", data);
    toast.success("Anti-Embarrassment Amount Updated!");
    return redirect("/dashboard");
  } catch (error) {
    toast.error(error?.response?.data?.msg);
    return error;
  }
};
const AntiEmbarrassment = () => {
  return (
    <Wrapper>
      <Form method="post" className="form">
        <h4>Set Anti-Embarrassment Amount</h4>
        <FormRow type="number" name="amount" />
        <SubmitBtn />
      </Form>
    </Wrapper>
  );
};

export default AntiEmbarrassment;
