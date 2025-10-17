<!-- 
======================================================================
== TOP OF PAGE: PERSISTENT HEADER
======================================================================
-->

[PROGRESS_BAR: 0% Complete]
[SCORE_TRACKER: Score: 0/100]

<!-- 
Developer's Note: 
- The PROGRESS_BAR should update as the user scrolls through and completes sections.
- The SCORE_TRACKER should update after the user completes the "Quick Test" and the "Descriptive Test".
-->

---

# **Tutorial: Projectile Motion - The Art of Throwing Things**

Welcome! Ever wondered about the graceful arc of a basketball heading for the hoop, or the path a cannonball takes? That's projectile motion in action! By the end of this tutorial, you'll not only understand it but will be able to predict it.

### **1. What is Projectile Motion? (The Intuitive Idea)**

Imagine you're in a car moving at a steady 50 km/h and you drop a ball out the window. From your perspective inside the car, the ball just drops straight down. But to someone standing on the sidewalk, the ball follows a curved path forward and down.

**This is the single most important idea:** **Projectile motion is two simple motions happening at the same time.**

1.  **Horizontal Motion:** The ball keeps moving forward at a constant speed (just like the car).
2.  **Vertical Motion:** The ball is pulled straight down by gravity, accelerating as it falls.

Our entire analysis of projectile motion is based on splitting a complex curved path into these two super-simple, independent parts.

---

### **2. Formal Definition & Key Assumptions**

> **Definition:** A **projectile** is any object that is thrown, shot, or launched into the air and then moves only under the influence of gravity. The path it follows is called its **trajectory**.

To make our calculations work, we start with a few simplifying assumptions. In our visualizer, we can turn these off later for fun!

*   **Assumption 1: Air resistance is ignored.** We pretend there's no air slowing the object down.
*   **Assumption 2: The acceleration due to gravity, `g`, is constant.** We'll use `g = 9.81 m/s²`. It always points straight down.
*   **Assumption 3: The Earth's rotation is ignored.**

---

### **3. The Two Components: A Deeper Look**

Let's break down the motion of an object launched with an initial velocity `v₀` at an angle `θ` from the ground.

[VISUALIZATION: INITIAL_VELOCITY_COMPONENTS]
<!-- 
Developer's Note: 
- This should be a static diagram or a simple animation.
- Show a vector `v₀` at an angle `θ` to the horizontal.
- Animate or show dashed lines "projecting" this vector onto the x and y axes.
- Label the horizontal component `v_x = v₀ * cos(θ)` and the vertical component `v_y₀ = v₀ * sin(θ)`.
- This visualization is key to understanding the math that follows.
-->

#### **Horizontal Motion (The Easy Part)**

*   **Force:** Zero (since we ignore air resistance).
*   **Acceleration:** Zero.
*   **Velocity (`v_x`):** **Constant!** It never changes throughout the flight.
*   **Formula:** `distance = speed × time` or `x = v_x * t`

#### **Vertical Motion (Just Like Dropping a Ball)**

*   **Force:** Gravity (`F = mg`), pointing down.
*   **Acceleration (`a_y`):** Constant, equal to `-g` (approx. `-9.81 m/s²`). It's negative because it points downward.
*   **Velocity (`v_y`):** Changes continuously. It starts positive (upwards), becomes zero at the very top of the arc, and then becomes negative (downwards).
*   **Formulas:** These are the standard kinematic equations:
    *   `v_y(t) = v_y₀ - g*t`
    *   `y(t) = y₀ + v_y₀*t - (1/2)g*t²`

**The Golden Link:** The one thing that connects both motions is **time (`t`)**. The projectile stops moving horizontally at the same instant it stops moving vertically (when it hits the ground).

---

### **4. Visualization: See It in Action!**

Let's see how these two components work together. The visualization below shows a projectile's path. Notice the "shadows" on the ground (x-axis) and the wall (y-axis).

*   The **ground shadow** moves at a constant speed.
*   The **wall shadow** moves up, slows down, stops at the peak, and then accelerates down.

[VISUALIZATION_ENGINE: STATIC_PROJECTILE]


---

### **5. The Key Formulas**

Here are the essential equations you'll need. Don't just memorize them; understand where they come from!

*   **Initial Velocity Components:**
    *   Horizontal: `v_x = v₀ * cos(θ)`
    *   Vertical: `v_y₀ = v₀ * sin(θ)`

*   **Position at any time `t`:**
    *   Horizontal: `x(t) = v_x * t`
    *   Vertical: `y(t) = y₀ + v_y₀*t - (1/2)g*t²`

*   **Special Cases (when launched from the ground, `y₀ = 0`):**

    *   **Maximum Height (H):** Occurs when the vertical velocity `v_y` is momentarily zero.
        > `H = (v₀² * sin²(θ)) / (2g)`

    *   **Time of Flight (T):** The total time the object is in the air. This is twice the time it takes to reach the maximum height.
        > `T = (2 * v₀ * sin(θ)) / g`

    *   **Range (R):** The total horizontal distance traveled.
        > `R = v_x * T = (v₀² * sin(2θ)) / g`
        > **Cool Fact:** The maximum range is achieved when `sin(2θ)` is maximum (i.e., 1), which happens when `2θ = 90°`, or `θ = 45°`.

---

### **6. Example 1: The Classic Cannonball**

**Problem:** A cannon fires a ball with an initial velocity of 100 m/s at an angle of 30° above the horizontal from ground level. Find its time of flight, maximum height, and range.

**Solution:**
1.  **Break down the initial velocity:**
    *   `v_x = 100 * cos(30°) = 100 * 0.866 = 86.6 m/s`
    *   `v_y₀ = 100 * sin(30°) = 100 * 0.5 = 50 m/s`
2.  **Calculate Time of Flight (T):**
    *   `T = (2 * v_y₀) / g = (2 * 50) / 9.81 = 10.2 s`
3.  **Calculate Maximum Height (H):**
    *   `H = (v_y₀²) / (2g) = (50²) / (2 * 9.81) = 2500 / 19.62 = 127.4 m`
4.  **Calculate Range (R):**
    *   `R = v_x * T = 86.6 * 10.2 = 883.3 m`

[VISUALIZATION_ENGINE: EXAMPLE_1_CANNONBALL]


---

### **7. Quick Test: Check Your Understanding!**

Answer the following questions to test your knowledge.

<!-- 
Developer's Note: 
- For each question, after the user clicks [Check Answer], reveal the correct answer and the explanation.
- If the user is correct, add points to the SCORE_TRACKER at the top of the page.
-->

**Question 1:** A cannonball is fired. At the very top of its trajectory, what is its vertical velocity (`v_y`)?
[INPUT_FIELD: Q1_ANSWER] [BUTTON: Check Answer]
> **Answer:** 0 m/s.
> **Explanation:** At the peak, the projectile has momentarily stopped moving up and has not yet started to move down. Its vertical velocity is zero, but its horizontal velocity is still `v_x`!

**Question 2:** If you ignore air resistance, what happens to the horizontal velocity of a projectile throughout its flight?
[RADIO_BUTTONS: Q2: Increases | Decreases | Stays the same] [BUTTON: Check Answer]
> **Answer:** Stays the same.
> **Explanation:** There are no horizontal forces acting on the projectile (in our idealized model), so there is no horizontal acceleration.

**Question 3:** Which launch angle gives the maximum possible range for a projectile?
[INPUT_FIELD: Q3_ANSWER] degrees [BUTTON: Check Answer]
> **Answer:** 45 degrees.
> **Explanation:** The range formula `R = (v₀² * sin(2θ)) / g` is maximized when `sin(2θ)` is maximized. The maximum value of the sine function is 1, which occurs when its argument is 90°. So, `2θ = 90°`, which means `θ = 45°`.

---

### **8. Descriptive Test: Apply Your Concepts**

Now, let's tackle some conceptual questions. Your answers will be evaluated by our AI tutor, Gemini, to provide you with personalized feedback.

<!-- 
Developer's Note:
- Provide a text area for the user to type their answer.
- The [Submit for Evaluation] button should send the user's answer and the question context to a backend service that calls the Gemini API.
- The prompt to Gemini should be structured carefully. Example prompt structure:
  ---
  "You are an expert physics tutor. A student was asked the following conceptual question about projectile motion: '{Question Text}'. The student provided this answer: '{User's Answer}'.
  
  Evaluate the student's answer based on the following key concepts:
  - {Concept 1: e.g., 'Understanding that range depends on both flight time and horizontal speed.'}
  - {Concept 2: e.g., 'Recognizing that a 70-degree launch has a long flight time but low horizontal speed.'}
  - {Concept 3: e.g., 'Recognizing that a 20-degree launch has a high horizontal speed but short flight time.'}
  - {Concept 4: e.g., 'Correctly identifying that they have the same range because they are complementary angles (20+70=90).'}

  Provide feedback in two parts:
  1. A score out of 10.
  2. A friendly, constructive paragraph explaining what they got right and what they could improve, referencing the key concepts."
  ---
- Display the score and the feedback paragraph to the user.
- Update the main SCORE_TRACKER at the top of the page.
-->

**Question 1:** You fire two projectiles from ground level with the same initial speed. One is fired at 20° and the other at 70°. Ignoring air resistance, which one will have the greater range? Explain your reasoning.

[TEXT_AREA: DESCRIPTIVE_Q1]
[BUTTON: Submit for Evaluation]

[FEEDBACK_AREA: GEMINI_FEEDBACK_Q1]

**Question 2:** Imagine you throw a ball horizontally from a tall cliff. At the exact same moment, your friend drops an identical ball from the same height. Which ball hits the ground first? Explain why.

[TEXT_AREA: DESCRIPTIVE_Q2]
[BUTTON: Submit for Evaluation]

[FEEDBACK_AREA: GEMINI_FEEDBACK_Q2]

---

<!-- 
======================================================================
== BOTTOM OF PAGE: CHAT-CONTROLLED VISUALIZER
======================================================================
-->

## **Playground: The Chat-Controlled Visualizer**

You've learned the theory, now it's time to experiment! Use plain English to command the visualizer. Ask it questions, change the parameters, and see what happens.

[VISUALIZER_ENGINE: CHAT_CONTROLLED_PROJECTILE]
