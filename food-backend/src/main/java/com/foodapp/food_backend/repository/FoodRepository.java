package com.foodapp.food_backend.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import com.foodapp.food_backend.model.FoodItem;

public interface FoodRepository extends JpaRepository<FoodItem, Long> {
}