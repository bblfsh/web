export const java_example_2 = `public class SwapElementsExample {

         public static void main(String[] args) {

                 int num1 = 10;
                 int num2 = 20;

                 System.out.println("Before Swapping");
                 System.out.println("Value of num1 is :" + num1);
                 System.out.println("Value of num2 is :" +num2);

                 //swap the value
                 swap(num1, num2);
         }

         private static void swap(int num1, int num2) {

                 int temp = num1;
                 num1 = num2;
                 num2 = temp;

                 System.out.println("After Swapping");
                 System.out.println("Value of num1 is :" + num1);
                 System.out.println("Value of num2 is :" +num2);

         }
 }
`;
