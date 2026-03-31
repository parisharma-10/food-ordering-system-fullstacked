package com.foodapp.food_backend.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;
import java.util.List;

import com.foodapp.food_backend.model.FoodItem;
import com.foodapp.food_backend.repository.FoodRepository;

@CrossOrigin(origins = "http://localhost:3001")
@RestController
@RequestMapping("/api/food")
public class FoodController {

    @Autowired
    private FoodRepository foodRepository;

    // GET all food items
    @GetMapping
    public List<FoodItem> getAllFood() {
        return foodRepository.findAll();
    }

    // POST new food item
    @PostMapping
    public FoodItem addFood(@RequestBody FoodItem foodItem) {
        return foodRepository.save(foodItem);
    }
    // DELETE food item
@DeleteMapping("/{id}")
public String deleteFood(@PathVariable Long id) {
    foodRepository.deleteById(id);
    return "Food deleted successfully";
}
@PutMapping("/{id}")
public FoodItem updateFood(@PathVariable Long id, @RequestBody FoodItem newFood) {
    return foodRepository.findById(id).map(food -> {
        food.setName(newFood.getName());
        food.setPrice(newFood.getPrice());
        return foodRepository.save(food);
    }).orElseThrow(() -> new RuntimeException("Food not found"));
}
}